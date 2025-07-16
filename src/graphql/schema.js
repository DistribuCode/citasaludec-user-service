/**
 * Esquema GraphQL para Perfil de Usuario
 * ------------------------------------
 * Incluye:
 * - Query: userProfile (devuelve objeto User)
 * - Mutations: registerUser, loginUser, updateProfile
 */

const { GraphQLSchema, GraphQLObjectType, GraphQLString } = require('graphql');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const UserType = new GraphQLObjectType({
    name: 'User',
    fields: {
        username: { type: GraphQLString },
        email: { type: GraphQLString },
        bio: { type: GraphQLString },
        avatarUrl: { type: GraphQLString },
        createdAt: { type: GraphQLString }
    }
});

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        userProfile: {
            type: UserType,
            async resolve(parent, args, context) {
                const token = (context.headers.authorization || "").split(" ")[1];
                if (!token) throw new Error("Token ausente o mal formado");

                let decoded;
                try {
                    decoded = jwt.verify(token, process.env.JWT_SECRET);
                } catch (err) {
                    throw new Error("Token inválido o expirado");
                }

                const user = await User.findOne({ username: decoded.username });
                if (!user) throw new Error("Usuario no encontrado");

                return user;
            }
        }
    }
});

const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        registerUser: {
            type: GraphQLString,
            args: {
                username: { type: GraphQLString },
                password: { type: GraphQLString },
                email: { type: GraphQLString }
            },
            async resolve(_, args) {
                const user = new User({
                    username: args.username,
                    password: args.password,
                    email: args.email
                });
                await user.save();
                return "✅ Usuario registrado correctamente";
            }
        },
        loginUser: {
            type: GraphQLString,
            args: {
                username: { type: GraphQLString },
                password: { type: GraphQLString }
            },
            async resolve(_, args) {
                const user = await User.findOne({ username: args.username });
                if (!user) throw new Error("❌ Usuario no encontrado");
                if (args.password !== user.password) throw new Error("❌ Contraseña incorrecta");

                const token = jwt.sign(
                    { username: user.username },
                    process.env.JWT_SECRET,
                    { expiresIn: '24h' }
                );
                return `Bearer ${token}`;
            }
        },
        updateProfile: {
            type: UserType,
            args: {
                email: { type: GraphQLString },
                bio: { type: GraphQLString },
                avatarUrl: { type: GraphQLString }
            },
            async resolve(_, args, context) {
                const token = (context.headers.authorization || "").split(" ")[1];
                if (!token) throw new Error("Token ausente o mal formado");

                let decoded;
                try {
                    decoded = jwt.verify(token, process.env.JWT_SECRET);
                } catch (err) {
                    throw new Error("Token inválido o expirado");
                }

                const updatedUser = await User.findOneAndUpdate(
                    { username: decoded.username },
                    { $set: { email: args.email, bio: args.bio, avatarUrl: args.avatarUrl }},
                    { new: true }
                );

                return updatedUser;
            }
        }
    }
});

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation
});
