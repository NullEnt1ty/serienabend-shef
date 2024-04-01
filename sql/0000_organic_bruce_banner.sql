CREATE TABLE `Chef` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`points` int NOT NULL DEFAULT 0,
	CONSTRAINT `name` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `History` (
	`id` int AUTO_INCREMENT NOT NULL,
	`date` datetime NOT NULL,
	`numberOfPersons` int NOT NULL,
	`chefId` int NOT NULL
);
--> statement-breakpoint
CREATE TABLE `Setting` (
	`settingsKey` varchar(255) NOT NULL,
	`settingsValue` longtext DEFAULT 'NULL'
);
--> statement-breakpoint
CREATE INDEX `history_ibfk_chef_id` ON `History` (`chefId`);--> statement-breakpoint
ALTER TABLE `History` ADD CONSTRAINT `History_chefId_Chef_id_fk` FOREIGN KEY (`chefId`) REFERENCES `Chef`(`id`) ON DELETE restrict ON UPDATE cascade;