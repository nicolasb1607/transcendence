-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'moderator', 'user');

-- CreateEnum
CREATE TYPE "UserRelationStatus" AS ENUM ('friend', 'blocked', 'requesting');

-- CreateEnum
CREATE TYPE "UserChannelRole" AS ENUM ('admin', 'user');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('offline', 'online', 'away', 'inGame');

-- CreateEnum
CREATE TYPE "GameType" AS ENUM ('classicPong', 'spatialPong');

-- CreateTable
CREATE TABLE "User" (
    "ID" SERIAL NOT NULL,
    "login" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'user',
    "status" "UserStatus" NOT NULL DEFAULT 'offline',
    "isTwoFAEnabled" BOOLEAN NOT NULL DEFAULT false,
    "TwoFASecret" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "User_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "UserMeta" (
    "ID" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "meta_key" TEXT NOT NULL,
    "meta_value" TEXT NOT NULL,

    CONSTRAINT "UserMeta_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "UserOauth" (
    "ID" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "provider" TEXT NOT NULL,
    "access_token" TEXT NOT NULL,
    "refresh_token" TEXT,
    "expiry_date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserOauth_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Message" (
    "ID" SERIAL NOT NULL,
    "emitter_id" INTEGER NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "channel_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Channel" (
    "ID" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'general',
    "owner_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "password" TEXT,
    "image" TEXT NOT NULL DEFAULT 'blue_lizards.jpg',

    CONSTRAINT "Channel_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "UserChannel" (
    "ID" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "channel_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_confirmed" BOOLEAN NOT NULL DEFAULT false,
    "is_ban" BOOLEAN NOT NULL DEFAULT false,
    "mute_end" TIMESTAMP(6),
    "role" "UserChannelRole" NOT NULL DEFAULT 'user',

    CONSTRAINT "UserChannel_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "UserAchievement" (
    "ID" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "achievement_id" INTEGER NOT NULL,
    "achieved_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserAchievement_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "GameStatistics" (
    "ID" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "game_id" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GameStatistics_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "UserRelation" (
    "ID" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "relation_id" INTEGER NOT NULL,
    "status" "UserRelationStatus" NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserRelation_pkey" PRIMARY KEY ("ID")
);

-- CreateTable
CREATE TABLE "Game" (
    "ID" SERIAL NOT NULL,
    "type" "GameType" NOT NULL DEFAULT 'classicPong',
    "players" INTEGER[],
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duration" INTEGER NOT NULL DEFAULT 0,
    "winner_id" INTEGER NOT NULL,
    "score" INTEGER[] DEFAULT ARRAY[0, 0]::INTEGER[],

    CONSTRAINT "Game_pkey" PRIMARY KEY ("ID")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_login_key" ON "User"("login");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserMeta_user_id_meta_key_key" ON "UserMeta"("user_id", "meta_key");

-- CreateIndex
CREATE UNIQUE INDEX "UserChannel_user_id_channel_id_key" ON "UserChannel"("user_id", "channel_id");

-- CreateIndex
CREATE UNIQUE INDEX "UserAchievement_user_id_achievement_id_key" ON "UserAchievement"("user_id", "achievement_id");

-- CreateIndex
CREATE UNIQUE INDEX "GameStatistics_user_id_game_id_key_key" ON "GameStatistics"("user_id", "game_id", "key");

