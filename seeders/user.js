const User = require('../models/user');
const { faker } = require('@faker-js/faker'); 

exports.createUser = async(numUsers) => {
    try {
        const userPromise = [];
        console.log(numUsers)
        for (let i = 0; i < numUsers; i++){
            const tempUser = await User.create({
                name: faker.person.fullName(),
                username: faker.internet.userName(),
                bio: faker.lorem.sentence(10),
                password: 123456,
                avatar: {
                    url: faker.image.avatar(),
                    public_id: faker.system.fileName(),
                }
            });

            userPromise.push(tempUser);
        }

        await Promise.all(userPromise);
        console.log("Fake user created", numUsers);
        process.exit(1);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}