
class Room {

    constructor() {
        this.index = -1;
        this.sock1 = undefined;
        this.sock2 = undefined;
        this.pass = '';
        this.public = false;
    }
}

class RoomList {

    constructor() {
        this.rooms = [];
        this.roomCount = 0;
    }

    addRoom(pass) {
        let r = new Room();
        r.pass = pass;
        let i = 0;
        for (;i < this.rooms.length; i++) if (this.rooms[i] === undefined) break;
        this.rooms[i] = r;
        r.index = i;
        this.roomCount++;
        return r;
    }

    removeRoom(room) {
        if (room === undefined) return;
        if (typeof room === 'object' && room.index !== undefined) {
            room = room.index;
        }
        if (typeof room === 'number') {
            if (room < 0 || room >= this.rooms.length || this.rooms[room] === undefined) return;
            if (this.rooms[room].sock1 !== undefined && this.rooms[room].sock1.readyState < 2) this.rooms[room].sock1.close();
            if (this.rooms[room].sock2 !== undefined && this.rooms[room].sock2.readyState < 2) this.rooms[room].sock2.close();
            this.rooms[room].sock1 = undefined;
            this.rooms[room].sock2 = undefined;
            this.rooms[room].index = -1;
            this.rooms[room] = undefined;
            this.roomCount--;
        }
    }

}

module.exports = {room: Room, room: RoomList};
