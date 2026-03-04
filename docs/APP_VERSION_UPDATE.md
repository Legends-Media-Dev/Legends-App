# App version / “Update required” flow

When you release a new build to the App Store (or Play Store), users on an older version can be prompted to update.

## How it works

1. On launch, the app calls **`getAppVersionConfigHandler`** (Cloud Function).
2. The backend returns a **minimum required version** (e.g. `"1.0.3"`).
3. If the app’s current version (from `app.json` → `expo.version`) is **less than** that value, a full-screen **“Update required”** modal is shown.
4. The user taps **Update** and is sent to the App Store / Play Store.

## Backend (Cloud Function)

Create a Cloud Function that responds to **GET** and returns JSON like:

```json
{
  "minVersion": "1.0.3",
  "iosStoreUrl": "https://apps.apple.com/app/idYOUR_APP_ID",
  "androidStoreUrl": "https://play.google.com/store/apps/details?id=com.legendsmedia.legends"
}
```

- **minVersion** (required): Minimum app version that is allowed. When you release `1.0.3`, set this to `"1.0.3"` so users on `1.0.2` or lower see the modal.
- **iosStoreUrl** / **androidStoreUrl** (optional): If omitted, the app uses default URLs (see `utils/versionCheck.js`; set `IOS_APP_STORE_ID` for iOS).

Example handler (Node):

```js
exports.getAppVersionConfigHandler = (req, res) => {
  res.set('Cache-Control', 'public, max-age=300'); // 5 min
  res.json({
    minVersion: "1.0.3",
    iosStoreUrl: "https://apps.apple.com/app/idYOUR_APPLE_ID",
    androidStoreUrl: "https://play.google.com/store/apps/details?id=com.legendsmedia.legends",
  });
};
```

Deploy it so it’s available at:

`https://us-central1-premier-ikon.cloudfunctions.net/getAppVersionConfigHandler`

## iOS App Store ID

In `utils/versionCheck.js`, replace `YOUR_APPLE_APP_ID` with your app’s numeric ID from App Store Connect (e.g. `1234567890`). That is used when the backend doesn’t return `iosStoreUrl`.

## Testing locally

### Option 1: Force the modal in dev

In development, you can force the “Update required” modal to show:

1. In your app (or via React Native debugger / Flipper), run:
   ```js
   AsyncStorage.setItem('FORCE_UPDATE_MODAL', '1');
   ```
2. Reload the app (e.g. shake device → Reload, or `r` in the Metro terminal).
3. The modal should appear. Tap **Update** to try the store link (will open store or browser).
4. To turn off: `AsyncStorage.removeItem('FORCE_UPDATE_MODAL')` and reload.

### Option 2: Use your backend

1. Deploy `getAppVersionConfigHandler` and return a **higher** `minVersion` than your current app (e.g. `"99.0.0"`).
2. Open the app; the version check will see it’s “outdated” and show the modal.
3. For production, set `minVersion` to the real minimum version you support (e.g. the version you just released).

## Releasing a new version

1. Bump `version` in `app.json` (e.g. to `"1.0.3"`).
2. Build and submit to the stores.
3. After the new version is live, update your Cloud Function to return `minVersion: "1.0.3"` (or whatever you released). Users still on `1.0.2` will then see the update modal on next launch.
