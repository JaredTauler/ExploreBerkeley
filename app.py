# Jared Tauler 3/29/22
import json
import base64
import os
import hashlib
import time

# flask
from flask import Flask, abort, redirect, url_for, request, session, render_template, jsonify, make_response
from flask_session import Session
from sqlalchemy_imageattach.context import store_context
from sqlalchemy_imageattach.stores.fs import HttpExposedFileSystemStore

# from sqlalchemy import or_, and_, case, literal_column, func, not_

# from sqlalchemy_imageattach.entity import store_context
# import sqlalchemy_imageattach

### Prepare app
app = Flask(__name__)
app.secret_key = os.urandom(16)
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get("DB_URI")  # sqlite:///test.db
app.config['SESSION_TYPE'] = "filesystem"

### DATABASE
import database as db

fs_store = HttpExposedFileSystemStore('image', 'image/')
app.wsgi_app = fs_store.wsgi_middleware(app.wsgi_app)
# app.wsgi_app = fs_store.wsgi_middleware(app.wsgi_app)


NoLoginWhitelist = [
	"/login"

]

@app.before_request
def guide ():
	if request.path == "/":  # If at root, redirect
		return redirect(url_for("Home"))
	if not session.get("id"):  # If not logged in,
		if not request.path in NoLoginWhitelist:  # If accessing a whitelisted route,
			args = request.args
			arguments = ""
			for key, val in zip(args.keys(), args.values()):
				arguments += f"{key}={val}&"
			if arguments != "":
				arguments = "?" + arguments[:-1]
			string = f"#{request.path[1:]}{arguments}"  # Redirect to path user was trying to access + remember
			# arguments.
			print(string)
			return redirect(url_for("Login") + string)

### ROUTES
@app.template_global()
def static_include (filename):
	fullpath = os.path.join(app.static_folder, filename)
	with open(fullpath, 'r') as f:
		return f.read()

@app.route('/logout', methods=["POST"])
def Logout ():
	# No need to check if given session has id. guide() should take care of that.
	session.pop("id")
	return "", 200

@app.route('/login', methods=["GET", "POST"])
def Login ():
	# session.pop("id")
	if request.method == "GET":
		return render_template("login.html")
	else:
		rd = request.form.to_dict()  # Get form data.
		row = db.User.query.filter_by(username=rd.get("username")).first()  # Get user from DB..
		if not row:  # Couldnt find user in DB.
			jsonify(["redirect", "username"]), 200
		if password(rd.get("password"), row.salt)[
			0] == row.hashed:  # Check given password hashed is same as one in database.
			session["id"] = row.id
			return jsonify(["pass", 0]), 200
		# Password didnt match
		return jsonify(["bad", "password"]), 200

@app.route('/home', methods=["GET", "POST"])
def Home ():
	# DEBUG
	# hashed, salt = password("a")
	# new = db.User(id="22", username="eviljared", hashed=hashed, salt=salt)
	# db.session.add(new)
	# db.session.commit()
	if request.method == "GET":
		return render_template("home.html")
	else:
		# rd = request.form.to_dict()  # Get form data
		rd = request.get_json()
		if rd["intent"] == "get_info":
			# Get all a user's tickets and not done tickets.
			id = session["id"]
			done = (
				db.session.query(db.Quest.id)
					.join(db.Ticket)
					.filter(db.Ticket.user_id == id)
			).subquery()

			not_done = (
				db.session.query(db.Quest)
					.filter(db.Quest.id.not_in(done))
			)

			done_ticket = (
				db.session.query(db.Quest, db.Ticket)
					.join(db.Ticket)
					.filter(db.Ticket.user_id == id)
			)
			js = json.dumps(
				{
					"done"   : done_ticket.all(),
					"notdone": not_done.all()
				},
				cls=db.JsonEncoder
			)
			return js, 200

@app.route("/quest", methods=["GET", "POST"])
def TurnInQuest ():
	if request.method == "GET":
		return render_template("quest.html")
	else:
		# Delete tickets that already exist with this quest.
		# I didnt have enough time to figure out how to cascade delete with SQLalchemy.
		# Using a loop for this is very very stupid and shouldn't be done unless you have 2 weeks to make a website.
		q = (
			db.session.query(db.Ticket)
				.filter(db.Ticket.quest_id == request.args["id"])
				.filter(db.Ticket.user_id == session["id"])
		)
		for i in q.all():
			id = i.id
			q = (
				db.session.query(db.TicketGood)
					.filter(db.TicketGood.id == id)
			)
			# A pre-existing ticket for this quest has already been verified. Cancel delete operation.
			if q.all():
				return
			q = (
				db.session.query(db.Ticket)
					.filter(db.Ticket.id == id)
			)
			q.delete()
			q = (
				db.session.query(db.TicketNew)
					.filter(db.TicketNew.id == id)
			)
			if q.all():
				q.delete()
			q = (
				db.session.query(db.TicketPicture)
					.filter(db.TicketPicture.id == id)
			)
			if q.all():
				q.delete()
		db.session.commit()

		# Write new ticket to DB.
		ticket = db.Ticket(
			user_id=session["id"],  # session["id"],
			quest_id=request.args["id"]
		)
		db.session.add(ticket)
		with store_context(fs_store):
			ticket.picture.from_file(request.files["ImageUpload"])
			print(ticket.picture)  # FIXME This crashes if this isnt here. No idea why.

		db.session.commit()

		new = db.TicketNew(
			id=ticket.id
		)
		db.session.add(new)
		db.session.commit()
		return "", 200

@app.route("/process_ticket", methods=["GET", "POST"])
def Process_Ticket ():
	if request.method == "GET":
		return render_template("process_ticket.html")
	else:
		rd = request.get_json()
		CurrentTicket = rd["current_ticket"]

		if CurrentTicket:
			if rd["decision"] == "accept":
				try:
					new = db.TicketGood(id=int(CurrentTicket))
					db.session.add(new)
				except Exception as e:
					db.session.rollback()
					print(e)
					return "", 500

			elif rd["decision"] == "reject":
				db.Ticket.query.filter(db.Ticket.id == int(CurrentTicket)).delete()

			db.TicketNew.query.filter(db.TicketNew.id == int(CurrentTicket)).delete()
			db.session.commit()

		if rd["intent"] == "get-ticket":
			row = db.Ticket.query.filter(db.Ticket.id == db.TicketNew.id).first()
			if row:
				with store_context(fs_store):
					url = row.picture.locate()
				user = db.User.query.filter(db.User.id == row.user_id).first()
				quest = db.Quest.query.filter(db.Quest.id == row.quest_id).first()
				print(user)
				return jsonify(
					{
						"picture-url": url,
						"ticket"     : {
							"id": row.id
						},
						"user"       : {
							"username": "test"  # user.username
						},
						"quest"      : {
							"name": quest.name,
							"task": quest.task
						}
					}
				)
			else:  # No more rows
				return '', 204

@app.route("/quest_manage", methods=["GET", "POST"])
def QuestManage ():
	if request.method == "GET":
		return render_template("quest_manage.html")
	else:
		rd = request.form.to_dict()
		if rd['intent'] == "save":
			row = db.Quest.query.filter(db.Quest.id == rd["id"]).first()

			DictToRow(row, rd)

			db.session.commit()
			return jsonify(""), 200
		elif rd['intent'] == "new":
			new = db.Quest()
			DictToRow(new, rd)
			db.session.add(new)
			db.session.commit()
			return jsonify(""), 200

@app.route("/quest_manage/ajax", methods=["GET"])
def QuestManageAjax ():
	if request.method == "GET":
		data = json.dumps(db.Quest.query.all(), cls=db.JsonEncoder)
		return data, 200

def DictToRow (row, dict):
	# This can probably be SQL injected. Only administrators can access this page so not a problem.
	for key, value in dict.items():
		if hasattr(row, key):
			setattr(row, key, value)

def password (password, salt=os.urandom(32)):
	hashed = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
	return hashed, salt

# hashed, salt = password("a")
# new = db.User(id="21", username="jared", hashed=hashed, salt = salt)
# db.session.add(new)
# db.session.commit()

### RUN
if __name__ == '__main__':
	app.run()
