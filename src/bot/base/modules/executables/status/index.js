module.exports = (status = 'Online' ) => `API.account.set${status}();API.status.set({text:"${status}"});return "ok";`;