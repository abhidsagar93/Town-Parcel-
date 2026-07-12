# Town Parcel — Admin Panel Setup

This `/admin` folder is a separate, password-protected area. It does **not**
touch or change your public `index.html` website in any way.

## 1. Where to put these files

Upload the entire `admin` folder (with `css/` and `js/` inside it) into the
**same GitHub repo** as your `index.html`, at the root level, so the
structure looks like this:

```
your-repo/
  index.html          <- your existing public website (unchanged)
  admin/
    login.html
    reset-password.html
    dashboard.html
    bookings.html
    partners.html
    riders.html
    messages.html
    css/
      admin.css
    js/
      supabase-client.js
      auth-guard.js
      ui-utils.js
      table-page.js
```

If you're using GitHub Pages, once this is pushed your admin panel will be
reachable at:
```
https://yourusername.github.io/your-repo-name/admin/login.html
```
It is **not linked from your public site** — only people with this exact
URL can reach the login page (and they still need a valid admin account to
get any further).

## 2. Run the SQL setup script (required)

Open your Supabase project → **SQL Editor** → paste in the contents of
`supabase_rls_setup.sql` → **Run**.

This does two things:
- Lets your public website's forms **insert** data (booking/partner/rider/
  contact submissions) without being able to read, edit, or delete anything.
- Lets **logged-in admins only** read, edit, and delete all records — this
  is what powers the dashboard and the view/edit/delete buttons.

If you already ran an earlier version of this script, it's safe to run
again — it drops and recreates policies by name.

## 3. Create your admin login (required)

Go to Supabase Dashboard → **Authentication → Users → Add User**.
Set an email and password for yourself. That's it — there is no public
sign-up page, by design, so only accounts you create here can log in.

You can add more admin accounts the same way later (e.g. for staff).

## 4. Log in

Open `admin/login.html`, sign in with the account you just created.
You should land on `dashboard.html` with live stats.

"Forgot password?" on the login page sends a real reset email via
Supabase — it links to `admin/reset-password.html`, which is included and
already wired up.

## 5. If something doesn't work

Open the browser console (right-click → Inspect → Console tab) on the
page that's failing, try the action again, and read the red error message.
Common causes:

- **"Failed to load data" / 400 or 401 errors** → the SQL policies in step 2
  haven't been run yet, or didn't run successfully.
- **Login page just refreshes / shows "Incorrect email or password"** →
  double check the account exists in Supabase → Authentication → Users, and
  that Email provider sign-in is enabled (Authentication → Providers).
- **Stuck on a blank white page** → check the console for a red error
  mentioning a missing file — this usually means the `css/` or `js/`
  subfolders didn't get uploaded, or a filename/path doesn't match exactly
  (case-sensitive on GitHub Pages).
- **Charts don't appear on the dashboard** → this needs an internet
  connection to load Chart.js from a CDN; it will fail silently if that
  CDN is blocked on your network.

If you're stuck, copy the exact console error (or a screenshot of it) and
share it — that error message tells us exactly which line to fix.
