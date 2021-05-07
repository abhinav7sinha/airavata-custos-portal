import {custosService} from "../util/custos.util";

const getDefaultState = () => {
    return {
        tenantsMap: {},
        tenantsListMap: {},
        tenantRolesMap: {},
        tenantRolesListMap: {}
    }
};

const state = getDefaultState();

const actions = {
    async fetchTenants({commit}, {limit, offset, status, requesterEmail}) {
        const params = {limit, offset, status, requesterEmail};
        const queryString = JSON.stringify(params);

        // const username = rootGetters["auth/currentUsername"];
        // await dispatch("user/fetchUsers", {username}, {root: true});
        // const requesterEmail = rootGetters["user/getUser"]({username}).email;

        let tenants = await custosService.tenants.getTenants(params);
        const tenantIds = tenants.map(({tenant_id, tenant_status, client_name, domain}) => {
            commit('SET_TENANT', {tenantId: tenant_id, status: tenant_status, name: client_name, domain});

            return tenant_id;
        });
        commit('SET_TENANT_LIST', {queryString, tenantIds});
    },
    async createTenantRole({commit}, {name, description, composite = false}) {
        const {id} = await custosService.tenants.createTenantRole({name, description, composite});

        commit('SET_TENANT_ROLE', {
            tenantRoleId: id,
            name,
            description,
            composite
        });
    },
    async fetchTenantRoles({commit}) {
        const DEFAULT_CUSTOS_ROLES = ["admin-read-only", "admin", "gateway-provider", "gateway-user", "offline_access",
            "uma_authorization", "user-pending"];

        let queryString = "";

        let {data: {roles}} = await custosService.tenants.fetchTenantRoles();
        const tenantRoleIds = roles.filter(({name}) => {
            return DEFAULT_CUSTOS_ROLES.indexOf(name) < 0
        }).map(({id, name, description, composite}) => {
            const tenantRoleId = id
            commit('SET_TENANT_ROLE', {tenantRoleId, name, description, composite});

            return tenantRoleId;
        });
        commit('SET_TENANT_ROLES_LIST', {queryString, tenantRoleIds});
    },
    async createChildTenant(o, {username, firstName, lastName, email, password, tenantName, redirectUris, scope, domain, clientUri, logoUri, comment, applicationType}) {
        const res = await custosService.tenants.createChildTenant({
            username,
            firstName,
            lastName,
            email,
            password,
            tenantName,
            redirectUris,
            scope,
            domain,
            clientUri,
            logoUri,
            comment,
            applicationType
        });

        console.log("createChildTenant ", res);

        const {client_id, client_secret} = res.data;

//         {
//  "client_id": "custos-xj1jamrkt4smtdz3tpn6-10001501",
//  "client_secret": "69vJnB744dWIirSaTWFrA1MHSxGmXRmkyJOwZOkv",
//  "is_activated": true,
//  "client_id_issued_at": 1618549123000,
//  "client_secret_expires_at": 0,
//  "registration_client_uri": "https://custos.scigap.org:32036/tenant-management/v1.0.0/oauth2/tenant?client_id=custos-xj1jamrkt4smtdz3tpn6-10001501",
//  "token_endpoint_auth_method": "client_secret_basic",
//  "msg": "Credentials are activated"
// }

        return {clientId: client_id, clientSecret: client_secret}

        // commit('SET_TENANT', {tenantId: client_id, status: "", clientSecret: client_secret, name: tenantName, domain});
    }

}

const mutations = {
    SET_TENANT(state, {tenantId, status, name, domain}) {
        state.tenantsMap = {
            ...state.tenantsMap,
            [tenantId]: {tenantId, status, name, domain}
        };
    },
    SET_TENANT_LIST(state, {queryString, tenantIds}) {
        state.tenantsListMap = {
            ...state.tenantsListMap,
            [queryString]: tenantIds
        }
    },
    SET_TENANT_ROLE(state, {tenantRoleId, name, description, composite}) {
        state.tenantRolesMap = {
            ...state.tenantRolesMap,
            [tenantRoleId]: {tenantRoleId, name, description, composite}
        };
    },
    SET_TENANT_ROLES_LIST(state, {queryString, tenantRoleIds}) {
        state.tenantRolesListMap = {
            [queryString]: tenantRoleIds
        }
    }
}

const getters = {
    getTenants(state, getters) {
        return ({limit, offset, status, requesterEmail}) => {
            const queryString = JSON.stringify({limit, offset, status, requesterEmail});
            console.log("###### getTenants : ", queryString)
            if (state.tenantsListMap[queryString]) {
                const r = state.tenantsListMap[queryString].map(tenantId => getters.getTenant({tenantId}));
                console.log("getTenants ==== ", r)
                return r
            } else {
                return null;
            }
        }
    },
    getTenant(state) {
        return ({tenantId}) => {
            if (state.tenantsMap[tenantId]) {
                return state.tenantsMap[tenantId];
            } else {
                return null;
            }
        }
    },
    getTenantRoles(state, getters) {
        return () => {
            const queryString = "";
            if (state.tenantRolesListMap[queryString]) {
                return state.tenantRolesListMap[queryString].map(tenantRoleId => getters.getTenantRole({tenantRoleId}));
            } else {
                return null;
            }
        }
    },
    getTenantRole(state) {
        return ({tenantRoleId}) => {
            if (state.tenantRolesMap[tenantRoleId]) {
                return state.tenantRolesMap[tenantRoleId];
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
