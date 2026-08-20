CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`price_paise` integer NOT NULL,
	`material` text NOT NULL,
	`size` text NOT NULL,
	`care` text NOT NULL,
	`image_url` text NOT NULL,
	`available` integer DEFAULT true NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL
);
