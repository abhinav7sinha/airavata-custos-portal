# Custos Portal

1. Install latest stable nodejs (v14.17) https://nodejs.org/en/download/
2. Install yarn `npm install --global yarn`
3. `git clone https://github.com/apache/airavata-custos-portal.git`
4. `cd ./airavata-custos-portal/custos-demo-gateway`
5. `git checkout reference-portal`
6. Change `.env` file with all new entries of following

```
VUE_APP_CLIENT_ID=""
VUE_APP_CLIENT_SEC=""

VUE_APP_REDIRECT_URI="http://localhost:8080/callback"

VUE_APP_CLIENT_ENTITY_TYPE_ID_ASSIGNMENT="APPOINTMENT"
VUE_APP_CLIENT_ENTITY_TYPE_ID_SUBMISSION="PATIENT_HISTORY"
VUE_APP_CLIENT_ENTITY_TYPE_ID_GRADING="PRESCRIPTION"

VUE_APP_CLIENT_ROLE_PROFESSOR="doctor"
VUE_APP_CLIENT_ROLE_TEACHING_ASSISTANT="nurse"
VUE_APP_CLIENT_ROLE_STUDENT="patient"

VUE_APP_CLIENT_GROUP_ID_STUDENT=""
VUE_APP_CLIENT_GROUP_ID_TEACHING_ASSISTANT=""

VUE_APP_CLIENT_PERMISSION_TYPE_VIEWER="VIEWER"
VUE_APP_CLIENT_PERMISSION_TYPE_EDITOR="EDITOR"
```

7. Create necessary entity types, permission types, roles, groups and update them on .env
8. `yarn install`
9. `yarn run serve`
10. http://localhost:8080

