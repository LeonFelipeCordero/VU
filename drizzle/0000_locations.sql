CREATE TABLE `locations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`latitude` real NOT NULL,
	`longitude` real NOT NULL,
	`source` text NOT NULL,
	`description` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	CONSTRAINT "locations_latitude_check" CHECK(typeof("locations"."latitude") IN ('real', 'integer') AND "locations"."latitude" BETWEEN -90 AND 90),
	CONSTRAINT "locations_longitude_check" CHECK(typeof("locations"."longitude") IN ('real', 'integer') AND "locations"."longitude" BETWEEN -180 AND 180),
	CONSTRAINT "locations_source_check" CHECK("locations"."source" IN ('app', 'crawler')),
	CONSTRAINT "locations_description_check" CHECK(length("locations"."description") <= 2000 AND length(trim("locations"."description", char(9,10,11,12,13,32,160,5760,8192,8193,8194,8195,8196,8197,8198,8199,8200,8201,8202,8232,8233,8239,8287,12288,65279))) > 0 AND instr("locations"."description", char(0)) = 0),
	CONSTRAINT "locations_created_at_check" CHECK(typeof("locations"."created_at") = 'integer' AND "locations"."created_at" >= 0),
	CONSTRAINT "locations_updated_at_check" CHECK(typeof("locations"."updated_at") = 'integer' AND "locations"."updated_at" >= "locations"."created_at")
);
