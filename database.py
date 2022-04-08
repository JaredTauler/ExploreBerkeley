import sqlalchemy.engine
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy_imageattach.entity import Image, image_attachment, store_context

from app import app  # Bad practice

db = SQLAlchemy(app)

class User(db.Model):
	# __tablename__ = "user"
	id = db.Column(db.Integer, primary_key=True)
	username = db.Column(db.String(80), unique=True, nullable=False)
	# email = db.Column(db.String(120), unique=True, nullable=False)
	hashed = db.Column(db.String(120), unique=False, nullable=False)
	salt = db.Column(db.String(120), unique=False, nullable=False)

class Worker(User):
	id = db.Column(db.Integer, db.ForeignKey('user.id'), primary_key=True)
	__mapper_args__ = {
		'polymorphic_identity': 'worker',
	}

class Quest(db.Model):
	# __tablename__ = "quest"
	id = db.Column(db.Integer, primary_key=True, autoincrement=True)
	name = db.Column(db.String(80), nullable=False)
	task = db.Column(db.String(80), nullable=False)
	info = db.Column(db.String(80), nullable=False)

class Ticket(db.Model):
	__tablename__ = "ticket"
	id = db.Column(db.Integer, primary_key=True, autoincrement=True)
	user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
	quest_id = db.Column(db.Integer, db.ForeignKey('quest.id'))
	picture = image_attachment('TicketPicture')
	worker_id = db.Column(db.Integer, db.ForeignKey('worker.id'), nullable=True)

	# picture = db.relationship(
	# 	"TicketPicture",
	# 	backref="ticket",
	# 	uselist=False,
	# 	cascade="all,delete",
	# )
	#
	# good = db.relationship(
	# 	"TicketGood",
	# 	backref="ticket",
	# 	uselist=False,
	# 	cascade="all,delete",
	# )

class TicketGood(db.Model):
	id = db.Column(db.Integer, db.ForeignKey('ticket.id'), primary_key=True)
	__mapper_args__ = {
		'polymorphic_identity': 'ticketgood',
	}

class TicketNew(db.Model):
	id = db.Column(db.Integer, db.ForeignKey('ticket.id'), primary_key=True)
	__mapper_args__ = {
		'polymorphic_identity': 'ticketnew',
	}

class TicketPicture(db.Model, Image):
	__tablename__ = "ticketpicture"
	id = db.Column(db.Integer, db.ForeignKey('ticket.id'), primary_key=True)

db.create_all()
db.session.commit()

session = db.session

import json
from sqlalchemy.ext.declarative import DeclarativeMeta

class JsonEncoder(json.JSONEncoder):
	def default (self, obj):
		def meta(obj):
			fields = {}
			for field in [x for x in dir(obj) if not x.startswith('_') and x != 'metadata']:
				data = obj.__getattribute__(field)
				try:
					json.dumps(data)  # this will fail on non-encodable values, like other classes
					fields[field] = data
				except TypeError:
					fields[field] = None
			# a json-encodable dict
			return fields
		if obj.__class__ == sqlalchemy.engine.row.Row:
			tables = {}
			for t in obj:
				tables[t.__table__.name] = meta(t)
			return tables

		if isinstance(obj.__class__, DeclarativeMeta):
			return meta(obj)

		return json.JSONEncoder.default(self, obj)
