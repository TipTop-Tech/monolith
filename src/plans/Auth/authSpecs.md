## Candidate Classes/Pages
- Users (class)
- AuthService (class) - Handles interactions with Supabase (login, register, OAuth, password reset).
- AuthGuard (component/wrapper) - Enforces routing unauthenticated users to the Sign In page.
- Sign In (page)
- Sign Up (page) - Separate page for new email/password registrations.
- Forgot Password (modal component) - A modal dialog defined in a separate file.
- Account (page)

## Feature Request

Please build an authentication service for Monolith, so user's can save their data and come back to it later on. The authentication needs to track emails, usernames, and passwords. It also needs to allow a Sign In with a Google Account or an Apple Account. Our backend in this case is Supabase, and interactions with it should be handled via a dedicated `AuthService` class.

There should be a `Sign In` page, and an `AuthGuard` component should automatically route to this page upon opening the app if the user is not signed in. Don't save the current progress pre-Authentication, just clear it so the user starts with a clean slate. The Sign In page should include two text boxes for email and password, two buttons prompting them to Sign in with Google or Sign with Apple, and a forgot password button. When clicked, the forgot password button should open a `Forgot Password` modal dialog defined in a separate file. 

Additionally, there should be a separate `Sign Up` page that users can navigate to from the Sign In page, specifically for registering new accounts using email and password.

When the user is signed in, there should be a new button on the bottom of the screen called Account. This will lead to the `Account` page, where for now the user will only be able to sign out. 