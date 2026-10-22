CREATE VIRTUAL TABLE `incidents_rtree` USING rtree(
  id, min_latitude, max_latitude, min_longitude, max_longitude
);
--> statement-breakpoint
INSERT INTO incidents_rtree SELECT id, latitude, latitude, longitude, longitude FROM incidents WHERE latitude IS NOT NULL AND longitude IS NOT NULL AND is_synthetic = 0;
--> statement-breakpoint
CREATE TRIGGER incidents_rtree_insert AFTER INSERT ON incidents WHEN NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL AND NEW.is_synthetic = 0 BEGIN
  INSERT INTO incidents_rtree VALUES (NEW.id, NEW.latitude, NEW.latitude, NEW.longitude, NEW.longitude);
END;
--> statement-breakpoint
CREATE TRIGGER incidents_rtree_update AFTER UPDATE OF id, latitude, longitude, is_synthetic ON incidents BEGIN
  DELETE FROM incidents_rtree WHERE id = OLD.id;
  INSERT INTO incidents_rtree SELECT NEW.id, NEW.latitude, NEW.latitude, NEW.longitude, NEW.longitude WHERE NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL AND NEW.is_synthetic = 0;
END;
--> statement-breakpoint
CREATE TRIGGER incidents_rtree_delete AFTER DELETE ON incidents BEGIN
  DELETE FROM incidents_rtree WHERE id = OLD.id;
END;
