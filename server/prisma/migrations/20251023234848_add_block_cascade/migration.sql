-- DropForeignKey
ALTER TABLE "public"."blocked_users" DROP CONSTRAINT "blocked_users_blocked_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."blocked_users" DROP CONSTRAINT "blocked_users_blocker_id_fkey";

-- AddForeignKey
ALTER TABLE "public"."blocked_users" ADD CONSTRAINT "blocked_users_blocker_id_fkey" FOREIGN KEY ("blocker_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."blocked_users" ADD CONSTRAINT "blocked_users_blocked_id_fkey" FOREIGN KEY ("blocked_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
