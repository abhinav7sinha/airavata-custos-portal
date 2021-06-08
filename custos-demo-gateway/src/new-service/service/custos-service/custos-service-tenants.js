import CustosService from "./index";

export default class CustosTenants {
    /**
     * @type {CustosService}
     */
    _custosService = null;

    constructor(custosService) {
        this._custosService = custosService;
    }

    get custosService() {
        return this._custosService;
    }

    fetchTenants({limit, offset, status, parentTenantId, parentClientId, parentClientSecret, requesterEmail}) {
        console.log("fetchTenants ", {limit, offset, status, parentTenantId, parentClientSecret, requesterEmail})

        let url = `${CustosService.ENDPOINTS.TENANTS}/tenants`
        const params = {
            limit: limit,
            offset: offset,
            // status: status,
            // requester_email: requesterEmail
        };

        // TODO fix.
        if (parentClientId !== "custos-6nwoqodstpe5mvcq09lh-10000101") {
            url = `${CustosService.ENDPOINTS.TENANTS}/child/tenants`;
            params["parent_client_id"] = parentClientId;
        } else {
            params["type"] = "ADMIN";
        }

        if (requesterEmail) {
            params["requester_email"] = requesterEmail;
        }

        return this.custosService.axiosInstanceWithTokenAuthorization.get(
            url, {params: params}
        ).then(({data}) => data)


    }

    /**
     * Create tenant role
     * @param {string} name
     * @param {string} description
     * @param {boolean} composite
     * @return {Promise<AxiosResponse<any>>}
     */
    createTenantRole({name, description, composite = false}) {
        return this.custosService.axiosInstanceWithTokenAuthorization.post(
            `${CustosService.ENDPOINTS.TENANTS}/roles`,
            {group: {name, description, composite}}
        ).then(({data}) => data);
    }

    /**
     * Fetch tenant roles
     * @return {Promise<AxiosResponse<any>>}
     */
    async fetchTenantRoles({clientId, clientLevel = false}) {
        const axiosInstance = await this.custosService.axiosInstanceWithTokenAuthorization;
        return axiosInstance.get(
            `${CustosService.ENDPOINTS.TENANTS}/roles`,
            {
                params: {
                    "client_id": clientId,
                    "client_level": clientLevel
                }
            }
        );
    }

    async createTenant({username, firstName, lastName, email, password, tenantName, redirectUris, scope, domain, clientUri, logoUri, comment, applicationType, parentClientId, parentClientSecret}) {
        let axiosInstance;
        if (parentClientId !== "custos-6nwoqodstpe5mvcq09lh-10000101") {
            axiosInstance = await this.custosService.getAxiosInstanceWithClientAuthorization({
                clientId: parentClientId,
                clientSecret: parentClientSecret
            });
        } else {
            axiosInstance = this.custosService.axiosInstance;
        }

        return axiosInstance.post(
            `${CustosService.ENDPOINTS.TENANTS}/oauth2/tenant`,
            {
                "client_name": tenantName,
                "requester_email": email,
                "admin_username": username,
                "admin_first_name": firstName,
                "admin_last_name": lastName,
                "admin_email": email,
                "contacts": [email],
                "redirect_uris": redirectUris,
                "scope": scope.join(" ").trim(),
                "domain": domain,
                "admin_password": password,
                "client_uri": clientUri,
                "logo_uri": logoUri,
                "application_type": applicationType,
                "comment": comment
            }
        );
    }

    updateTenant({username, firstName, lastName, email, tenantId, clientId, tenantName, redirectUris, scope, domain, clientUri, logoUri, comment, applicationType, requesterEmail}) {
        let axiosInstance = this.custosService.axiosInstanceWithTokenAuthorization;

        return axiosInstance.put(
            `${CustosService.ENDPOINTS.TENANTS}/oauth2/tenant`,
            {
                "admin_username": username,
                "admin_first_name": firstName,
                "admin_last_name": lastName,
                "admin_email": email,
                "id": tenantId,
                "client_id": clientId,
                "client_name": tenantName,
                "redirect_uris": redirectUris,
                "scope": scope.join(" ").trim(),
                "domain": domain,
                "client_uri": clientUri,
                "logo_uri": logoUri,
                "application_type": applicationType,
                "comment": comment,
                "requesterEmail": requesterEmail
            }
        );
    }

    fetchTenant({clientId}) {
        return this.custosService.axiosInstanceWithTokenAuthorization.get(
            `${CustosService.ENDPOINTS.TENANTS}/oauth2/tenant`,
            {
                params: {
                    client_id: clientId
                }
            }
        ).then(({data}) => data)
    }

    updateTenantStatus({clientId, status}) {
        return this.custosService.axiosInstanceWithTokenAuthorization.post(
            `${CustosService.ENDPOINTS.TENANTS}/status`,
            {
                client_id: clientId,
                status: status
            }
        ).then(({data}) => data)
    }

}
