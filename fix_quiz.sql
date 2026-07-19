ALTER TABLE "Quiz" ALTER COLUMN "title" TYPE json USING json_build_object('en', "title");
