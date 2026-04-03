rooms: {
    async list() {
        return API.call('/rooms');
    },

    async create(name) {
        const res = await API.call('/rooms', {
            method: 'POST',
            body: { name },
        });

        // ✅ SAVE ROOM (IMPORTANT FIX)
        if (res.success && res.data?.room) {
            UserStorage.setRoom(res.data.room);
            console.log("✅ Room stored (create):", res.data.room);
        }

        return res;
    },

    async join(roomId) {
        const res = await API.call(`/rooms/${roomId}/join`, {
            method: 'POST'
        });

        // ✅ SAVE ROOM (IMPORTANT FIX)
        if (res.success && res.data?.room) {
            UserStorage.setRoom(res.data.room);
            console.log("✅ Room stored (join):", res.data.room);
        }

        return res;
    },
}
