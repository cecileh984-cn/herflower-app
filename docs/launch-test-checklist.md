# HerFlower Launch Test Checklist

Use this checklist before every public release. Test on desktop and phone width.

## 1. Public Pages

- [ ] Open the homepage.
- [ ] Confirm the HerFlower logo, name, and main buttons are visible.
- [ ] Open Terms from the sidebar.
- [ ] Open Privacy from the sidebar.
- [ ] Open Support from the sidebar.
- [ ] Check the site on a phone-sized screen and confirm there is no sideways scrolling.

## 2. New Member Signup

- [ ] Create a new account with a real email address.
- [ ] Confirm the password field works.
- [ ] Try a birthday under 18 and confirm signup is blocked.
- [ ] Try signup without the 18+ checkbox and confirm signup is blocked.
- [ ] Try signup without agreeing to Terms/Privacy and confirm signup is blocked.
- [ ] Complete signup with valid details.
- [ ] Open the confirmation email.
- [ ] Click the confirmation link and return to HerFlower.
- [ ] Log in with the new account.

## 3. Verification Flow

- [ ] Open Verification.
- [ ] Upload a selfie image.
- [ ] Upload an ID document image.
- [ ] Submit for review.
- [ ] Confirm the status becomes pending.
- [ ] Confirm the uploaded files appear in Supabase Storage.
- [ ] Confirm the request appears in the Supabase verifications table.

## 4. Admin Review

- [ ] Log in as the admin account.
- [ ] Open Admin.
- [ ] Confirm the pending verification is visible.
- [ ] Approve the user.
- [ ] Confirm the user profile status becomes approved in Supabase.
- [ ] Log back in as the new user.
- [ ] Confirm the user can access Discover, Community, Messages, and Profile.

## 5. Profile Setup

- [ ] Open Edit profile.
- [ ] Add or update display name.
- [ ] Add country and city.
- [ ] Add languages.
- [ ] Add interests and looking-for tags.
- [ ] Upload a profile avatar.
- [ ] Save the profile.
- [ ] Confirm the profile page displays the updated information.
- [ ] Confirm the avatar file appears in the profile-avatars bucket.

## 6. Discover And Messages

- [ ] Use Account A and Account B, both approved.
- [ ] Account A opens Discover.
- [ ] Account A starts a message with Account B.
- [ ] Account B opens Messages and sees the conversation.
- [ ] Account B replies.
- [ ] Account A sees the reply.
- [ ] Refresh the chat page and confirm messages remain visible.

## 7. Community

- [ ] Create a post.
- [ ] Confirm the post appears in Community.
- [ ] Open the post detail page.
- [ ] Add a comment.
- [ ] Confirm the comment appears after refresh.
- [ ] Confirm the post and comment rows exist in Supabase.

## 8. Reports And Moderation

- [ ] Report a post.
- [ ] Report a comment.
- [ ] Report a message.
- [ ] Report a user.
- [ ] Open Admin and confirm the reports appear.
- [ ] Mark one report as reviewing.
- [ ] Mark one report as resolved.
- [ ] Dismiss one report.
- [ ] Hide one reported post or comment.
- [ ] Confirm hidden content no longer appears publicly.

## 9. Block And Ban

- [ ] Account A blocks Account B.
- [ ] Confirm Account A cannot send to Account B.
- [ ] Confirm the button changes to Unblock user.
- [ ] Unblock Account B.
- [ ] Confirm messages can be sent again.
- [ ] Admin bans a test user.
- [ ] Confirm the banned user sees access blocked.
- [ ] Admin restores the user.
- [ ] Confirm the restored user can use the app again.

## 10. Account Deletion Request

- [ ] Open Profile.
- [ ] Submit an account deletion request.
- [ ] Confirm the request appears in Admin.
- [ ] Admin marks the request reviewing.
- [ ] Admin marks the request completed.

## 11. Production Safety Checks

- [ ] Confirm the live URL is using `https://herflower-app.vercel.app`.
- [ ] Confirm Supabase Site URL is `https://herflower-app.vercel.app`.
- [ ] Confirm Supabase Redirect URLs include `https://herflower-app.vercel.app/**`.
- [ ] Confirm Vercel has `NEXT_PUBLIC_SUPABASE_URL`.
- [ ] Confirm Vercel has `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- [ ] Confirm private verification buckets are not public.
- [ ] Confirm profile-avatars bucket is public.
- [ ] Confirm no secret service role key is exposed in the frontend.

## 12. Final Decision

- [ ] All critical flows pass.
- [ ] No broken mobile layout found.
- [ ] No private ID document is publicly visible.
- [ ] Reports and blocking work.
- [ ] Admin can approve, reject, hide, ban, restore, and handle deletion requests.
- [ ] Ready for a very small private beta.
