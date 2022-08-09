CREATE EXTENSION pg_trgm;
CREATE EXTENSION btree_gin;
CREATE INDEX list_name_index ON "List" USING GIN (to_tsvector('english', name));
CREATE INDEX list_description_index ON "List" USING GIN (to_tsvector('english', description));