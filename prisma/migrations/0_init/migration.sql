-- CreateTable
CREATE TABLE `active_items` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `item_id` BIGINT NOT NULL,
    `expiration_date` DATETIME(0) NOT NULL,

    INDEX `active_items_items_FK`(`item_id` ASC),
    INDEX `active_items_users_FK`(`user_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bans` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `reason` VARCHAR(100) NOT NULL DEFAULT 'No reason',
    `user_id` BIGINT NOT NULL,
    `admin_id` BIGINT NOT NULL,
    `issued_on` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `bans_users_FK`(`user_id` ASC),
    INDEX `bans_users_admin_FK`(`admin_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `command_cooldowns` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `command_id` BIGINT NOT NULL,
    `expiration` DATETIME(0) NULL,

    INDEX `cmdcd_commandsFK`(`command_id` ASC),
    INDEX `cmdcd_usersFK`(`user_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `commands` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `command` VARCHAR(255) NOT NULL,
    `description` LONGTEXT NOT NULL,
    `cooldown` BIGINT NOT NULL DEFAULT 0,

    UNIQUE INDEX `commands_command_key`(`command` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `gifs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `link` VARCHAR(1000) NULL,
    `purpose` SMALLINT NOT NULL DEFAULT 0,

    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inventory` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `amount` INTEGER NULL,
    `user_id` BIGINT NOT NULL,
    `item_id` BIGINT NOT NULL,

    INDEX `item_ownership_items_FK`(`item_id` ASC),
    INDEX `item_ownership_users_FK`(`user_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `items` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `item_name` VARCHAR(50) NULL,
    `description` VARCHAR(500) NULL,
    `buy_cost` INTEGER NULL,
    `sell_cost` INTEGER NULL,
    `buyable` TINYINT NULL,
    `sellable` TINYINT NULL,
    `useable` TINYINT NOT NULL DEFAULT 0,
    `multiple_usable` TINYINT NOT NULL DEFAULT 0,
    `shop` TINYINT NOT NULL DEFAULT 0,
    `stock` INTEGER NOT NULL DEFAULT 0,
    `activable` TINYINT NOT NULL DEFAULT 0,
    `active_duration` BIGINT NOT NULL DEFAULT 0,
    `targetable` TINYINT NOT NULL DEFAULT 0,
    `item_image` VARCHAR(500) NULL,

    UNIQUE INDEX `items_item_name_key`(`item_name` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kill_msg` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `message` VARCHAR(500) NOT NULL,

    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `love` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `rating` INTEGER NOT NULL,
    `user1_id` BIGINT NOT NULL,
    `user2_id` BIGINT NOT NULL,
    `expires` DATETIME(0) NOT NULL,

    INDEX `love_users_user1`(`user1_id` ASC),
    INDEX `love_users_user2`(`user2_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` VARCHAR(50) NULL,
    `points` BIGINT NULL DEFAULT 0,
    `stash` BIGINT NOT NULL DEFAULT 0,
    `max_stash` BIGINT NOT NULL DEFAULT 25000,
    `permissions` INTEGER NOT NULL DEFAULT 0,
    `soap_status` SMALLINT NULL DEFAULT 0,
    `passive` TINYINT NOT NULL DEFAULT 0,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `avatar_url` LONGTEXT NULL,
    `tag` LONGTEXT NULL,
    `email` LONGTEXT NULL,

    UNIQUE INDEX `users_user_id_key`(`user_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `web_rewards` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `reward_name` VARCHAR(100) NOT NULL,
    `description` VARCHAR(500) NOT NULL,
    `contents` LONGTEXT NOT NULL,
    `target` BIGINT NOT NULL DEFAULT 0,
    `cooldown` BIGINT NOT NULL DEFAULT -1,
    `reward_claims` INTEGER NOT NULL DEFAULT 1,

    INDEX `web_rewards_users_FK`(`target` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `web_rewards_claims` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `reward_id` BIGINT NOT NULL,
    `expiration` DATETIME(0) NOT NULL DEFAULT ('9999-12-31 23:59:59'),

    INDEX `web_rewards_claims_users_FK`(`user_id` ASC),
    INDEX `web_rewards_claims_web_rewards_FK`(`reward_id` ASC),
    PRIMARY KEY (`id` ASC)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `active_items` ADD CONSTRAINT `active_items_items_FK` FOREIGN KEY (`item_id`) REFERENCES `items`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `active_items` ADD CONSTRAINT `active_items_users_FK` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bans` ADD CONSTRAINT `bans_users_FK` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `bans` ADD CONSTRAINT `bans_users_admin_FK` FOREIGN KEY (`admin_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `command_cooldowns` ADD CONSTRAINT `cmdcd_commandsFK` FOREIGN KEY (`command_id`) REFERENCES `commands`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `command_cooldowns` ADD CONSTRAINT `cmdcd_usersFK` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory` ADD CONSTRAINT `item_ownership_items_FK` FOREIGN KEY (`item_id`) REFERENCES `items`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inventory` ADD CONSTRAINT `item_ownership_users_FK` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `love` ADD CONSTRAINT `love_users_user1` FOREIGN KEY (`user1_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `love` ADD CONSTRAINT `love_users_user2` FOREIGN KEY (`user2_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `web_rewards` ADD CONSTRAINT `web_rewards_users_FK` FOREIGN KEY (`target`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `web_rewards_claims` ADD CONSTRAINT `web_rewards_claims_users_FK` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `web_rewards_claims` ADD CONSTRAINT `web_rewards_claims_web_rewards_FK` FOREIGN KEY (`reward_id`) REFERENCES `web_rewards`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

