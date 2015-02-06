A poorly written proof-of-concept application built on the [Harvest API](https://www.getharvest.com/api). It shows a very poorly styled time table of your company’s timers for today:

![Screenshot of the application’s only view, a table of your company’s timers](https://cloud.githubusercontent.com/assets/14930/6084138/82c1c01a-adfc-11e4-9bd3-de748ae420cc.png)

## Running Locally

### Configuring the Environment

You’ll need a Harvest account with administrator privileges to generate an OAuth2 client for use in development. A [free trial account](https://www.getharvest.com/signup) will do. Once signed in to your Harvest account, navigate to **Profile Menu > Account Settings > OAuth2 Clients > Create a New Client**.

Be sure to get your Redirect URI correct (`http://localhost:8080` is the default in development).

Provide your **Client ID** and **Client Secret** as environmental variables:

```sh
export HARVEST_CLIENT_ID="[your client id]"
export HARVEST_CLIENT_SECRET="[your client secret]"
```

If you’re not planning on using the default host of `http://localhost:8080`, you’ll need to set one additional variable:

```sh
export SERVER_URL="http://example.com" # do not include a trailing slash
```

### Installing Dependencies

All dependencies are installed with npm:

```sh
npm install
```

### Start the Application

Start the application using npm:

```sh
npm start
```

Once the application is running, navigate to [localhost:8080](http://localhost:8080) to get started!
