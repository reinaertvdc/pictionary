
class Room {

    constructor() {
        this.index = -1;
        this.sockets = [];
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
        setTimeout(() => {
            let activeConn = false;
            for (let i = 0; i < r.sockets.length; i++) {
                if (r.sockets[i] !== undefined && r.sockets[i].readyState <= 1) {
                    activeConn = true;
                    break;
                }
            }
            if (!activeConn) {
                this.removeRoom(r.index);
            }
        }, 30000);
        console.log('Created room (' + r.index + ')');
        return r;
    }

    removeRoom(room) {
        if (room === undefined) return;
        if (typeof room === 'object' && room.index !== undefined) {
            room = room.index;
        }
        if (typeof room === 'number') {
            if (room < 0 || room >= this.rooms.length || this.rooms[room] === undefined) return;
            if (this.rooms[room].sockets !== undefined && this.rooms[room].sockets.length > 0) {
                for (let i = 0; i < this.rooms[room].sockets.length; i++) {
                    if (this.rooms[room].sockets[i] !== undefined && this.rooms[room].sockets[i].readyState < 2) {
                        this.rooms[room].sockets[i].close();
                    }
                }
            }
            this.rooms[room].sockets = [];
            this.rooms[room].index = -1;
            this.rooms[room] = undefined;
            this.roomCount--;
            console.log('Deleted room (' + room + ')');
        }
    }

}

module.exports = {Room: Room, RoomList: RoomList};
