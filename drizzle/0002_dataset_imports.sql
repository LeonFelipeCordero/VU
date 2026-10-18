CREATE TABLE `datasets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`version` text NOT NULL,
	`url` text NOT NULL,
	`license` text NOT NULL,
	`file_sha256` text NOT NULL,
	`coverage` text NOT NULL,
	`imported_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `datasets_release` ON `datasets` (`name`,`version`);--> statement-breakpoint
CREATE TABLE `incidents` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`source_record_id` integer NOT NULL,
	`category` text,
	`source_category` text,
	`latitude` real,
	`longitude` real,
	`location_precision` text,
	`location_method` text,
	`area_id` text,
	`area_scheme` text,
	`area_version` text,
	`occurred_start` integer,
	`occurred_end` integer,
	`time` text,
	`published_at` integer,
	`source_severity` text,
	`quality_flags` text NOT NULL,
	`is_synthetic` integer NOT NULL,
	FOREIGN KEY (`source_record_id`) REFERENCES `source_records`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "incidents_coordinates_check" CHECK(("incidents"."latitude" IS NULL AND "incidents"."longitude" IS NULL) OR
    ("incidents"."latitude" IS NOT NULL AND "incidents"."longitude" IS NOT NULL AND
    typeof("incidents"."latitude") IN ('real','integer') AND "incidents"."latitude" BETWEEN -90 AND 90 AND
    typeof("incidents"."longitude") IN ('real','integer') AND "incidents"."longitude" BETWEEN -180 AND 180)),
	CONSTRAINT "incidents_interval_check" CHECK("incidents"."occurred_end" IS NULL OR
    ("incidents"."occurred_start" IS NOT NULL AND "incidents"."occurred_end" >= "incidents"."occurred_start")),
	CONSTRAINT "incidents_synthetic_check" CHECK("incidents"."is_synthetic" IN (0, 1))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `incidents_source_record` ON `incidents` (`source_record_id`);--> statement-breakpoint
CREATE TABLE `source_records` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`dataset_id` integer NOT NULL,
	`record_key` text NOT NULL,
	`source_record_id` text,
	`row_number` integer NOT NULL,
	`raw` text NOT NULL,
	FOREIGN KEY (`dataset_id`) REFERENCES `datasets`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "source_records_row_check" CHECK("source_records"."row_number" > 0)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `source_records_key` ON `source_records` (`dataset_id`,`record_key`);