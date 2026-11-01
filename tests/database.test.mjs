import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';

const USER1 = '11111111-1111-4111-8111-111111111111';
const USER2 = '22222222-2222-4222-8222-222222222222';
const sql = readFileSync(new URL('../supabase/schema.sql', import.meta.url), 'utf8');
async function database() {
  const db = new PGlite();
  await db.exec(`
    create schema auth;
    create table auth.users(id uuid primary key, raw_user_meta_data jsonb default '{}');
    create role anon nologin;
    create role authenticated nologin;
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  `);
  await db.exec(sql);
  await db.query('insert into auth.users(id, raw_user_meta_data) values ($1, $2), ($3, $4)', [USER1, JSON.stringify({ full_name: 'First driver' }), USER2, JSON.stringify({ full_name: 'Second driver' })]);
  return db;
}
async function asUser(db, id, fn) {
  return db.transaction(async tx => {
    await tx.query('select set_config($1, $2, true)', ['request.jwt.claim.sub', id || '']);
    await tx.exec(`set local role ${id ? 'authenticated' : 'anon'};`);
    return fn(tx);
  });
}
const insertVehicle = (tx, name) => tx.query('insert into vehicles(name) values ($1) returning id', [name]);
const insertExpense = (tx, vehicleId, amount = 100) => tx.query('insert into expenses(vehicle_id, title, category, amount_paise) values ($1, $2, $3, $4) returning id', [vehicleId, 'Test expense', 'fuel', amount]);

test('schema is idempotent and the signup trigger creates owner profiles', async () => {
  const db = await database();
  try {
    await db.exec(sql);
    assert.equal((await db.query('select * from profiles')).rows.length, 2);
    assert.equal((await db.query('select full_name from profiles where id=$1', [USER1])).rows[0].full_name, 'First driver');
    const tables = (await db.query("select tablename, rowsecurity from pg_tables where schemaname='public'")).rows;
    assert.equal(tables.length, 3); assert.ok(tables.every(t => t.rowsecurity));
  } finally { await db.close(); }
});
test('RLS isolates reads, updates and deletes between two authenticated users', async () => {
  const db = await database();
  try {
    const v1 = (await asUser(db, USER1, tx => insertVehicle(tx, 'Car one'))).rows[0].id;
    const v2 = (await asUser(db, USER2, tx => insertVehicle(tx, 'Car two'))).rows[0].id;
    await asUser(db, USER1, tx => insertExpense(tx, v1));
    await asUser(db, USER2, tx => insertExpense(tx, v2));
    await asUser(db, USER1, async tx => {
      assert.equal((await tx.query('select * from vehicles')).rows.length, 1);
      assert.equal((await tx.query('select * from expenses')).rows.length, 1);
      assert.equal((await tx.query('select * from profiles')).rows.length, 1);
      assert.equal((await tx.query('update vehicles set name=$1 where id=$2 returning id', ['Hijack', v2])).rows.length, 0);
      assert.equal((await tx.query('delete from vehicles where id=$1 returning id', [v2])).rows.length, 0);
      assert.equal((await tx.query('update profiles set city=$1 where id=$2 returning id', ['Pune', USER2])).rows.length, 0);
      assert.equal((await tx.query('update expenses set amount_paise=200 where vehicle_id=$1 returning id', [v2])).rows.length, 0);
    });
    assert.equal((await db.query('select name from vehicles where id=$1', [v2])).rows[0].name, 'Car two');
  } finally { await db.close(); }
});
test('anonymous clients and profile identity changes are denied by grants', async () => {
  const db = await database();
  try {
    await assert.rejects(() => asUser(db, null, tx => tx.query('select * from vehicles')), e => e.code === '42501');
    await assert.rejects(() => asUser(db, null, tx => tx.query('select * from expenses')), e => e.code === '42501');
    await assert.rejects(() => asUser(db, USER1, tx => tx.query('update profiles set id=$1', [USER2])), e => e.code === '42501');
    await assert.rejects(() => asUser(db, USER1, tx => tx.query('insert into profiles(id) values ($1)', [USER2])), e => e.code === '42501');
  } finally { await db.close(); }
});
test('composite ownership prevents cross-account vehicle references and reassignment', async () => {
  const db = await database();
  try {
    const v1 = (await asUser(db, USER1, tx => insertVehicle(tx, 'One'))).rows[0].id;
    const v2 = (await asUser(db, USER2, tx => insertVehicle(tx, 'Two'))).rows[0].id;
    const e1 = (await asUser(db, USER1, tx => insertExpense(tx, v1))).rows[0].id;
    await assert.rejects(() => asUser(db, USER1, tx => insertExpense(tx, v2)), e => e.code === '23503');
    await assert.rejects(() => asUser(db, USER1, tx => tx.query('update expenses set vehicle_id=$1 where id=$2', [v2, e1])), e => e.code === '23503' || e.code === '42501');
    await assert.rejects(() => asUser(db, USER1, tx => tx.query('insert into expenses(vehicle_id,user_id,title,category,amount_paise) values ($1,$2,$3,$4,$5)', [v2, USER2, 'Forged', 'fuel', 100])), e => e.code === '42501');
  } finally { await db.close(); }
});
test('money, fuel category, registration and currency constraints are enforced', async () => {
  const db = await database();
  try {
    const v1 = (await asUser(db, USER1, tx => insertVehicle(tx, 'One'))).rows[0].id;
    await assert.rejects(() => asUser(db, USER1, tx => insertExpense(tx, v1, -1)), e => e.code === '23514');
    await assert.rejects(() => asUser(db, USER1, tx => tx.query("insert into expenses(vehicle_id,title,category,amount_paise,fuel_litres) values ($1,'Bad','parking',100,2)", [v1])), e => e.code === '23514');
    await assert.rejects(() => asUser(db, USER1, tx => tx.query("update profiles set currency='USD'")), e => e.code === '23514');
    await asUser(db, USER1, tx => tx.query("update vehicles set registration='MH 12 AB 1234' where id=$1", [v1]));
    await assert.rejects(() => asUser(db, USER1, tx => tx.query("insert into vehicles(name,registration) values ('Duplicate','MH12AB1234')")), e => e.code === '23505');
  } finally { await db.close(); }
});
test('primary switching is atomic, owner-scoped, and vehicle deletion cascades', async () => {
  const db = await database();
  try {
    const v1 = (await asUser(db, USER1, tx => insertVehicle(tx, 'One'))).rows[0].id;
    const v2 = (await asUser(db, USER1, tx => insertVehicle(tx, 'Two'))).rows[0].id;
    await asUser(db, USER1, tx => tx.query('update vehicles set is_primary=true where id=$1', [v1]));
    await asUser(db, USER1, tx => tx.query('select set_primary_vehicle($1)', [v2]));
    assert.equal((await db.query('select id from vehicles where is_primary')).rows[0].id, v2);
    await assert.rejects(() => asUser(db, USER2, tx => tx.query('select set_primary_vehicle($1)', [v1])), e => /Vehicle not found/.test(e.message));
    await assert.rejects(() => asUser(db, null, tx => tx.query('select set_primary_vehicle($1)', [v1])), e => e.code === '42501');
    await asUser(db, USER1, tx => insertExpense(tx, v2));
    await asUser(db, USER1, tx => tx.query('delete from vehicles where id=$1', [v2]));
    assert.equal((await db.query('select * from expenses where vehicle_id=$1', [v2])).rows.length, 0);
  } finally { await db.close(); }
});
