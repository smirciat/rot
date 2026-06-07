module.exports = {
apps : [{
	name: "rot",
	script: "/home/andy/ROT/dist/server",
	interpreter: "/home/andy/.nvm/versions/node/v12.22.12/bin/node",
	env: {
		NODE_ENV: "production"
	}
}]
};