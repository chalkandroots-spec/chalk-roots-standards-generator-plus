# Chalk & Roots CCSS ELA K–8 D1 import

The source catalog contains 739 coded standards and subparts. It is split into eight SQL files to make Cloudflare D1 Console imports manageable.

## Import order

Run each file in order, one at a time, in the Cloudflare D1 Console for **chalk-roots-standards**:

1. `ccss-ela-k8-part-01.sql` — 100 rows
2. `ccss-ela-k8-part-02.sql` — 100 rows
3. `ccss-ela-k8-part-03.sql` — 100 rows
4. `ccss-ela-k8-part-04.sql` — 100 rows
5. `ccss-ela-k8-part-05.sql` — 100 rows
6. `ccss-ela-k8-part-06.sql` — 100 rows
7. `ccss-ela-k8-part-07.sql` — 100 rows
8. `ccss-ela-k8-part-08.sql` — 39 rows

Each batch uses `INSERT OR IGNORE`, so the original nine curated records are preserved and rerunning a batch will not duplicate existing IDs.

## Important schema note

The live database table includes `grade_band`; the repository schema was missing that field. The schema file has now been aligned. For an existing database, do not recreate or drop the table.

## Verify after all eight batches

Run:

```sql
SELECT COUNT(*) AS ccss_ela_k8_count
FROM standards
WHERE framework = 'CCSS'
  AND subject = 'ELA'
  AND grade BETWEEN 0 AND 8;
```

Expected count: **739 or more** if the database already contains other matching CCSS ELA entries; the 739 source rows are the import scope before deduplication.

Check grade coverage:

```sql
SELECT grade, grade_band, COUNT(*) AS standards
FROM standards
WHERE framework = 'CCSS' AND subject = 'ELA'
GROUP BY grade, grade_band
ORDER BY grade, grade_band;
```

Do not proceed to frontend validation until all batches report success and the count query has been checked.
