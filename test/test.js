var request = require('request'),
	assert = require('assert');

// TEST 1 - API Call testing
describe('GET /api', function () {
	it("should respond with status 200", function (done) {
		request('http://localhost:3000/user', function (err, resp) {
			assert.equal(resp.statusCode, 200);
			done();
		});
	});
});

// TEST 2 - GET Json Return from api
var jsonResult = '{"__v":0,"_id":"5239b973ece1ab3058000002","images":["img.png","./public/images/like.jpg"],"following":["fulano@gmail.com","fulano@gmail.com","vagner2@gmail.com","vagner3@gmail.com"],"password":"123456","email":"vagner@gmail.com","name":"Vagner"}';
describe('JSON return', function () {
	it("shoud respond with json of user data", function (done) {
		request('http://localhost:3000/user/vagner@gmail.com', function (err, resp) {
			assert.equal(resp.body, jsonResult);
			done();
		});
	});
});