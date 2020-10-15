from flask import render_template, request
from flask_socketio import disconnect, emit, send, join_room, leave_room
from app import app, io


all_sids = set()
user_sid_vs_peerid = {}
user_sid_vs_roomid = {}
roomid_vs_sids = {}


@app.route('/')
def index():
    return render_template('index.html', title='Index')


# @app.route('/stream')
# def stream():
#     return render_template('index.html', title='Index')


@io.on('connect')
def pingping():
    all_sids.add(request.sid)
    print("Connected....!!")


@io.on('make-new-room')
def make_new_room(room_id):
    user_sid_vs_roomid[request.sid] = room_id
    roomid_vs_sids[room_id] = {request.sid}
    join_room(room_id)


@io.on('ask-to-join-room')
def ask_to_join_room(data):
    peer_id = data['peerId']
    room_id = data['roomId']
    user_sid_vs_roomid[request.sid] = room_id
    join_room(room_id)
    emit('user-connected', peer_id, room=room_id, broadcast=True)


# @io.on('join-room')
# def join_a_room(peer_id):
#     user_sid_vs_roomid[request.sid] = room_id
#     roomid_vs_sids[room_id] = {request.sid}
#     join_room(room_id)
#     emit('user-connected', peer_id, room=room_id, broadcast=True)


@io.on('new-peer')
def store_peer_id(peer_id):
    print("-------------NEW PEER--------------")
    user_sid_vs_peerid[request.sid] = peer_id


@io.on('disconnect')
def disconnect():
    peer_id = user_sid_vs_peerid[request.sid]
    if user_sid_vs_roomid[request.sid]:
        room_id = user_sid_vs_roomid[request.sid]
        del user_sid_vs_roomid[request.sid]
    emit('user-disconnected', peer_id, room=room_id, broadcast=True)
