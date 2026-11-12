# K–8 Common Core ELA import

## Files
- `ccss-ela-k8-import.sql` — one-time D1 import. It adds the `grade_band` column and inserts the K–8 Common Core ELA coded standards and lettered subparts.
- The original nine Chalk & Roots curated standards are protected by `INSERT OR IGNORE`; their IDs and curated records are not overwritten.

## Scope
The generated file contains 739 coded records across:
- RL Reading: Literature
- RI Reading: Informational Text
- RF Reading: Foundational Skills (K–5)
- W Writing
- SL Speaking and Listening
- L Language
- RH Reading: History/Social Studies (6–8 supplemental)
- RST Reading: Science and Technical Subjects (6–8 supplemental)
- WHST Writing: History/Social Studies, Science, and Technical Subjects (6–8 supplemental)

The 6–8 supplemental standards are grade-band standards, not separate grade 6, 7, and 8 statements. They are stored once with `grade=6` and `grade_band='6-8'`; the updated Worker search includes them for grade 6, 7, and 8 searches.

## Source and verification
The statements are drawn from a machine-readable transcription of the Common Core ELA/Literacy standards and should be checked against the official CCSS document before broad public release:
https://corestandards.org/wp-content/uploads/2023/09/ADA-Compliant-ELA-Standards.pdf

The official source explains that K–8 has individual grade-level standards, while the supplemental content-area literacy section is organized in grade bands. The import intentionally excludes anchor-only entries, un-coded section headings, and placeholders such as “not applicable” or “begins in grade …”.

## Apply once
After confirming that the existing nine records are present, open the D1 Console for `chalk-roots-standards`, paste the entire contents of `ccss-ela-k8-import.sql`, and execute it once. Do not run it a second time: it includes an `ALTER TABLE` statement to add `grade_band`.

Then verify:
```sql
SELECT COUNT(*) AS total
FROM standards
WHERE framework='CCSS' AND subject='ELA' AND grade BETWEEN 0 AND 8;

SELECT grade, grade_band, strand, COUNT(*) AS records
FROM standards
WHERE framework='CCSS' AND subject='ELA' AND grade BETWEEN 0 AND 8
GROUP BY grade, grade_band, strand
ORDER BY grade, grade_band, strand;
```

The SQL file is a prepared import, not proof that the records have already been loaded into the live database.
