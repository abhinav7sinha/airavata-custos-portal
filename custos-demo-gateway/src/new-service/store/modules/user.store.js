import {custosService} from "../util/custos.util";

const getDefaultState = () => {
    return {
        userMap: {},
        userListMap: {}
    }
}

const state = getDefaultState()

const actions = {
    async fetchUsers({commit}, {username = null, offset = 0, limit = 10, groupId = null}) {
        const params = {username, offset, limit, groupId};
        const queryString = JSON.stringify(params);
        const users = await custosService.users.findUsers(params);

        const usernames = users.map((
            {id, username, first_name, last_name, email, realm_roles, client_roles, attributes, membership_type}
        ) => {
            commit("SET_USER", {
                id,
                username,
                firstName: first_name,
                lastName: last_name,
                email,
                realmRoles: realm_roles,
                clientRoles: client_roles,
                attributes,
                membershipType: membership_type
            });

            return username;
        });

        commit("SET_USER_LIST", {queryString, usernames})
    }
}


const mutations = {
    SET_USER(state, {id, username, firstName, lastName, email, realmRoles, clientRoles, attributes, membershipType}) {
        state.userMap = {
            ...state.userMap,
            [username]: {id, username, firstName, lastName, email, realmRoles, clientRoles, attributes, membershipType}
        }
    },
    SET_USER_LIST(state, {queryString, usernames}) {
        state.userListMap = {
            ...state.userListMap,
            [queryString]: usernames
        }
    }
}

const getters = {
    getUser: (state) => ({username}) => {
        if (state.userMap[username]) {
            console.log("####### state.userMap[username] : ", state.userMap[username])
            return state.userMap[username];
        } else {
            return null;
        }
    },
    getUsers(state, getters) {
        return ({username, offset, limit, groupId}) => {
            const params = {username, offset, limit, groupId};
            const queryString = JSON.stringify(params);
            if (state.userListMap[queryString]) {
                const usernames = state.userListMap[queryString];
                return usernames.map(username => getters.getUser({username}));
            } else {
                return null;
            }
        }
    }
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}