-- Add grade-band metadata to support standards such as RH.6-8.1.
ALTER TABLE standards ADD COLUMN grade_band TEXT;
