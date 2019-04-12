import initialUsersList from "../initial-data/base-accounts.json";
import logger from "../services/logger";

//  export default createBaseAccounts;
module.exports = function(server) {
  const User = server.models.user;
  const Role = server.models.Role;
  const RoleMapping = server.models.RoleMapping;

  return User.find()
    .then((accounts) => {
      if (accounts.length < 1) {
        return User.create(initialUsersList);
      }
      return null;
    })
    .then((accounts) => {
      if (accounts) {
        logger.publish(4, "loopback", "boot:createSample:res", accounts);
        return (
          accounts[0].profileAddress.create({
            street: "98 Rue des Garennes",
            streetNumber: 98,
            streetName: "Rue des Garennes",
            postalCode: 38390,
            city: " Bouvesse-Quirieu",
            public: true,
          }) &&
          // accounts[1].profileAddress.create({
          //   street: "98 Rue des Garennes",
          //   streetNumber: 98,
          //   streetName: "Rue des Garennes",
          //   postalCode: 38390,
          //   city: " Bouvesse-Quirieu",
          //   public: true,
          // }) &&
          //  create roles
          Role.find({name: "admin"}).then((roles) => ({accounts, roles}))
        );
      }
      return null;
    })
    .then((payload) => {
      // get account and role from payload
      logger.publish(4, "loopback", "boot:createPrincipal:req", payload.roles);
      if (payload && payload.accounts && payload.roles) {
        const myPayload = {...payload};
        myPayload.roles[5].principals
          .create({
            principalType: RoleMapping.USER,
            principalId: myPayload.accounts[0].id,
          })
          .then((principal) => {
            myPayload.principal = principal;
            logger.publish(4, "loopback", "boot:createPrincipal:res", principal);
            return myPayload;
          });
        return myPayload.roles[1].principals
          .create({
            principalType: RoleMapping.USER,
            principalId: myPayload.accounts[1].id,
          })
          .then((principal) => {
            myPayload.principal = principal;
            logger.publish(4, "loopback", "boot:createPrincipal:res", principal);
            return myPayload;
          });
      }
      return null;
    })
    .catch((err) => {
      logger.publish(2, "loopback", "boot:createSample:err", err);
      return err;
    });
};
