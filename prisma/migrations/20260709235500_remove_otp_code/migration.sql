-- Removes the OtpCode table: authentication switched from OTP-over-email to
-- Google OAuth (stateless — no server-side auth-code table needed).
DROP TABLE "OtpCode";
