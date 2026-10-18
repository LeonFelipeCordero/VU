CREATE VIRTUAL TABLE `locations_rtree` USING rtree(
  id, min_latitude, max_latitude, min_longitude, max_longitude
);
--> statement-breakpoint
INSERT INTO `locations_rtree`
  SELECT id, latitude, latitude, longitude, longitude FROM `locations`;
--> statement-breakpoint
CREATE TRIGGER `locations_rtree_insert` AFTER INSERT ON `locations` BEGIN
  INSERT INTO locations_rtree VALUES (NEW.id, NEW.latitude, NEW.latitude, NEW.longitude, NEW.longitude);
END;
--> statement-breakpoint
CREATE TRIGGER `locations_rtree_update` AFTER UPDATE OF id, latitude, longitude ON `locations` BEGIN
  DELETE FROM locations_rtree WHERE id = OLD.id;
  INSERT INTO locations_rtree VALUES (NEW.id, NEW.latitude, NEW.latitude, NEW.longitude, NEW.longitude);
END;
--> statement-breakpoint
CREATE TRIGGER `locations_rtree_delete` AFTER DELETE ON `locations` BEGIN
  DELETE FROM locations_rtree WHERE id = OLD.id;
END;
