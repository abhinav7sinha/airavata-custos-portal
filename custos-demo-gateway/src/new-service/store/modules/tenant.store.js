import {custosService} from "../util/custos.util";

const getDefaultState = () => {
    return {
        tenantsMap: {},
        clientIdToTenantIdMap: {},
        tenantsListMap: {},
        tenantsListPaginationMap: {},
        tenantRolesMap: {},
        tenantRolesListMap: {}
    }
};

const state = getDefaultState();

const actions = {
    async fetchTenantSecret({commit}, {clientId}) {
        const clientSecret = await custosService.identity.getClientSecret({clientId});
        console.log("STORE : fetchTenantSecret ", clientSecret);

        commit('SET_TENANT_SECRET', {clientId, clientSecret});
    },
    async fetchTenants({commit, rootGetters}, {limit, offset, status, requesterEmail, parentTenantId, parentClientId}) {
        const params = {limit, offset, status, requesterEmail, parentTenantId, parentClientId};

        console.log("STORE : fetchTenants ", params);
        const queryString = JSON.stringify(params);

        // const username = rootGetters["auth/currentUsername"];
        // await dispatch("user/fetchUsers", {username}, {root: true});
        // const requesterEmail = rootGetters["user/getUser"]({username}).email;

        let {tenant, total_num_of_tenants} = await custosService.tenants.fetchTenants(params);
        const tenantIds = tenant.map(({tenant_id, tenant_status, client_name, domain, client_id, parent_tenant_id, admin_username}) => {
            let type = "CHILD_TENANT";
            let hasAdminPrivileges = false;
            let currentUsername = rootGetters["auth/currentUsername"];

            // TODO fix
            if (client_id === "custos-6nwoqodstpe5mvcq09lh-10000101") {
                type = "SUPER_TENANT";
            } else if (parent_tenant_id === "0") {
                type = "ADMIN_TENANT";
            }

            if (currentUsername === admin_username) {
                hasAdminPrivileges = true;
            }

            commit('SET_TENANT', {
                tenantId: tenant_id,
                status: tenant_status,
                name: client_name,
                domain,
                clientId: client_id,
                type, hasAdminPrivileges
            });

            return tenant_id;
        });
        commit('SET_TENANT_LIST', {queryString, tenantIds});

        const pagination = {totalRows: total_num_of_tenants, perPage: limit, activePage: offset + 1};
        commit('SET_TENANT_LIST_PAGINATION', {queryString, pagination});
    },


    async fetchTenant({commit, rootGetters}, {clientId}) {
        let tenant = await custosService.tenants.fetchTenant({clientId});
        console.log("----- fetchTenant : ", tenant);
//         admin_email: "hasithanjo2work@gmail.com"
// admin_first_name: "Hasitha"
// admin_last_name: "Jayasundara"
// admin_password: ""
// admin_username: "hasithanjo2work@gmail.com"
        const {
            admin_username, admin_first_name, admin_last_name, admin_email,
            tenant_id, tenant_status, client_name, domain,
            redirect_uris, scope, client_uri, logo_uri, comment, application_type,
            parent_tenant_id
        } = tenant;

        let type = "CHILD_TENANT";
        let hasAdminPrivileges = false;
        let currentUsername = rootGetters["auth/currentUsername"];

        // TODO fix
        if (clientId === "custos-6nwoqodstpe5mvcq09lh-10000101") {
            type = "SUPER_TENANT";
        } else if (parent_tenant_id === "0") {
            type = "ADMIN_TENANT";
        }

        if (currentUsername === admin_username) {
            hasAdminPrivileges = true;
        }

        commit('SET_TENANT', {
            username: admin_username, firstName: admin_first_name, lastName: admin_last_name, email: admin_email,
            tenantId: tenant_id, status: tenant_status, name: client_name, domain, clientId,
            redirectUris: redirect_uris, scope: scope, clientUri: client_uri,
            logoUri: logo_uri, comment: comment, applicationType: application_type,
            type, hasAdminPrivileges
        });
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
    async fetchTenantRoles({commit}, {clientId}) {
        const DEFAULT_CUSTOS_ROLES = [
            // "admin-read-only", "admin", "gateway-provider", "gateway-user", "offline_access",
            // "uma_authorization", "user-pending"
        ];

        let queryString = JSON.stringify({clientId});

        let {data: {roles}} = await custosService.tenants.fetchTenantRoles({clientId});
        const tenantRoleIds = roles.filter(({name}) => {
            return DEFAULT_CUSTOS_ROLES.indexOf(name) < 0
        }).map(({id, name, description, composite}) => {
            const tenantRoleId = id
            commit('SET_TENANT_ROLE', {tenantRoleId, name, description, composite});

            return tenantRoleId;
        });
        commit('SET_TENANT_ROLES_LIST', {queryString, tenantRoleIds});
    },
    async createTenant(o, {username, firstName, lastName, email, password, tenantName, redirectUris, scope, domain, clientUri, logoUri, comment, applicationType, parentClientId, parentClientSecret}) {
        const res = await custosService.tenants.createTenant({
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
            applicationType,
            parentClientId,
            parentClientSecret
        });

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
    },

    async updateTenant(o, {tenantId, clientId, username, firstName, lastName, email, password, tenantName, redirectUris, scope, domain, clientUri, logoUri, comment, applicationType, requesterEmail}) {
        await custosService.tenants.updateTenant({
            tenantId,
            clientId,
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
            applicationType,
            requesterEmail
        });
    },
    async updateTenantStatus({commit}, {clientId, status}) {
        await custosService.tenants.updateTenantStatus({clientId, status});
        commit('SET_TENANT_STATUS', {clientId, status});
    }

}

const mutations = {
    SET_TENANT(state, {
        username = null, firstName = null, lastName = null, email = null,
        tenantId, status, name, domain, clientId, redirectUris = null, scope = null,
        clientUri = null, logoUri = null, comment = null, applicationType = null,
        type, hasAdminPrivileges
    }) {
        state.tenantsMap = {
            ...state.tenantsMap,
            [clientId]: {
                ...state.tenantsMap[clientId],
                username, firstName, lastName, email,
                tenantId, status, name, domain, clientId,
                redirectUris, scope, clientUri, logoUri, comment, applicationType,
                type, hasAdminPrivileges
            }
        };
        state.clientIdToTenantIdMap = {
            ...state.clientIdToTenantIdMap,
            [tenantId]: clientId
        };
    },
    SET_TENANT_SECRET(state, {clientId, clientSecret}) {
        state.tenantsMap = {
            ...state.tenantsMap,
            [clientId]: {
                ...state.tenantsMap[clientId],
                clientSecret
            }
        };
    },
    SET_TENANT_STATUS(state, {clientId, status}) {
        state.tenantsMap = {
            ...state.tenantsMap,
            [clientId]: {
                ...state.tenantsMap[clientId],
                status
            }
        };
    },
    SET_TENANT_LIST(state, {queryString, tenantIds}) {
        state.tenantsListMap = {
            ...state.tenantsListMap,
            [queryString]: tenantIds
        }
    },
    SET_TENANT_LIST_PAGINATION(state, {queryString, pagination}) {
        state.tenantsListPaginationMap = {
            ...state.tenantsListPaginationMap,
            [queryString]: pagination
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
        return ({limit, offset, status, requesterEmail, parentTenantId, parentClientId}) => {
            const queryString = JSON.stringify({limit, offset, status, requesterEmail, parentTenantId, parentClientId});
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
    getTenantsPagination(state) {
        return ({limit, offset, status, requesterEmail, parentTenantId, parentClientId}) => {
            const queryString = JSON.stringify({limit, offset, status, requesterEmail, parentTenantId, parentClientId});
            if (state.tenantsListPaginationMap[queryString]) {
                return state.tenantsListPaginationMap[queryString];
            } else {
                return null;
            }
        }
    },
    getTenant(state) {
        return ({tenantId, clientId}) => {
            if (state.clientIdToTenantIdMap[tenantId]) {
                return state.tenantsMap[state.clientIdToTenantIdMap[tenantId]];
            } else if (state.tenantsMap[clientId]) {
                return state.tenantsMap[clientId];
            } else {
                return null;
            }
        }
    },
    getTenantRoles(state, getters) {
        return ({clientId}) => {
            const queryString = JSON.stringify({clientId});
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
