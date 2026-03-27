const users = [{
    id: 1,
    email: 'admin@admin.com',
    // password: admin
    password: '$2b$10$QgxQKFIMx11VseT792MKfO5Hjs82uU8gKRe71IfBj1n0QZRRaIb2C',
    name: 'Admin',
    role: 'Admin'
}, {
    id: 2,
    email: 'user@user.com',
    // password: user
    password: '$2b$10$7wj6xH1TPVOUxFLMa6hYWedzWdzylgjPmjaW.d61xX85.R51/2feW',
    name: 'User',
    role: 'User'
}];

module.exports = { users };