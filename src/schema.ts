import { makeExecutableSchema } from '@graphql-tools/schema'
import { DateTimeResolver } from 'graphql-scalars'
import { context, Context } from './context'

const typeDefs = `
type Mutation {
  createDraft(authorEmail: String!, data: PostCreateInput!): Post
  deletePost(id: Int!): Post
  incrementPostViewCount(id: Int!): Post
  signupUser(data: UserCreateInput!): User!
  togglePublishPost(id: Int!): Post
  
  createGender(data: GenderInput!): Gender
  UpdateGender(data: GenderInput!): Gender
  DeleteGender(data: GenderInput!): Gender
  DeleteAllGender(data: GenderInput!) : Gender
}
type Query {
  allUsers: [User!]!
  allOwners: [Owner!]!
  allGender: [Gender!]!
  draftsByUser(userUniqueInput: UserUniqueInput!): [Post]
  feed(orderBy: PostOrderByUpdatedAtInput, searchString: String, skip: Int, take: Int): [Post!]!
  postById(id: Int): Post
}

input GenderInput {
  id: Int!
  type: String
}

type Post {
  author: User
  content: String
  createdAt: DateTime!
  id: Int!
  published: Boolean!
  title: String!
  updatedAt: DateTime!
  viewCount : Int!
}

type Owner {
  id  :      Int!
  email :    String!  
  fullname:  String!
  password:  String!
  createdAt: DateTime!
  updateAt : DateTime!
  isActive:  Boolean  
}
type Gender {
  id      :      Int!
  type    :    String!   
}

input PostCreateInput {
  content: String
  title: String!
}


input PostOrderByUpdatedAtInput {
  updatedAt: SortOrder!
} 

enum SortOrder {
  asc
  desc
}

type User {
  email: String!
  id: Int!
  name: String
  posts: [Post!]!
}

input UserCreateInput {
  email: String!
  name: String
  posts: [PostCreateInput!]
}
input onwerCreateInput {
  email: String!
  fullname: String 
}

input UserUniqueInput {
  email: String
  id: Int
}

scalar DateTime
`

const resolvers = {
  Query: {
    allGender: (_parent: any, _args: any, context: Context) => {
      return context.prisma.gender.findMany()
    },
    allOwners: (_parent: any, _args: any, context: Context) => {
      return context.prisma.owner.findMany()
    },
    allUsers: (_parent: any, _args: any, context: Context) => {
      return context.prisma.user.findMany()
    },
    postById: (_parent: any, args: { id: number }, context: Context) => {
      return context.prisma.post.findUnique({
        where: { id: args.id || undefined },
      })
    },
    feed: (
      _parent: any,
      args: {
        searchString: string
        skip: number
        take: number
        orderBy: PostOrderByUpdatedAtInput
      },
      context: Context,
    ) => {
      const or = args.searchString
        ? {
          OR: [
            { title: { contains: args.searchString } },
            { content: { contains: args.searchString } },
          ],
        }
        : {}
      return context.prisma.post.findMany({
        where: {
          published: true,
          ...or,
        },
        take: args?.take,
        skip: args?.skip,
        orderBy: args?.orderBy,
      })
    },
    draftsByUser: (
      _parent: any,
      args: { userUniqueInput: UserUniqueInput },
      context: Context,
    ) => {
      return context.prisma.user
        .findUnique({
          where: {
            id: args.userUniqueInput.id || undefined,
            email: args.userUniqueInput.email || undefined,
          },
        })
        .posts({
          where: {
            published: false,
          },
        })
    },
  },
  Mutation: {
    createGender: (
      _parent: any,
      args: { data: GenderInput },
      context: Context,
    ) => { 
      return context.prisma.gender.create({
        data: {
          type: args.data.type
        },
      })
    },
    UpdateGender: (
      _parent: any,
      args: { data: GenderInput },
      context: Context,
    ) => {
      return context.prisma.gender.update({
        where: {
          id: args.data.id,
        },
        data: {
          type: args.data.type
        },
      })
    },
    DeleteGender: (
      _parent: any,
      args: { data: GenderInput },
      context: Context,
    ) => {
      return context.prisma.gender.delete({
        where: {
          id: args.data.id,
        }
      })
    },
    DeleteAllGender: (
      _parent: any,
      args: { data: GenderInput },
      context: Context,
    ) => {
      const dd =  context.prisma.gender.deleteMany()
      console.log(dd.then((data)=>{
        return data.count;
      }))
       return null
    },




    signupUser: (
      _parent: any,
      args: { data: UserCreateInput },
      context: Context,
    ) => {
      const postData = args.data.posts?.map((post) => {
        return { title: post.title, content: post.content || undefined }
      })

      return context.prisma.user.create({
        data: {
          name: args.data.name,
          email: args.data.email,
          posts: {
            create: postData,
          },
        },
      })
    },
    createDraft: (
      _parent: any,
      args: { data: PostCreateInput; authorEmail: string },
      context: Context,
    ) => {
      return context.prisma.post.create({
        data: {
          title: args.data.title,
          content: args.data.content,
          author: {
            connect: { email: args.authorEmail },
          },
        },
      })
    },
    togglePublishPost: async (
      _parent: any,
      args: { id: number },
      context: Context,
    ) => {
      try {
        const post = await context.prisma.post.findUnique({
          where: { id: args.id || undefined },
          select: {
            published: true,
          },
        })
        return context.prisma.post.update({
          where: { id: args.id || undefined },
          data: { published: !post?.published },
        })
      } catch (error) {
        throw new Error(
          `Post with ID ${args.id} does not exist in the database.`,
        )
      }
    },
    incrementPostViewCount: (
      _parent: any,
      args: { id: number },
      context: Context,
    ) => {
      return context.prisma.post.update({
        where: { id: args.id || undefined },
        data: {
          viewCount: {
            increment: 1,
          },
        },
      })
    },
    deletePost: (_parent: any, args: { id: number }, context: Context) => {
      return context.prisma.post.delete({
        where: { id: args.id },
      })
    },
  },
  DateTime: DateTimeResolver,
  Post: {
    author: (parent: any, _args: any, context: Context) => {
      return context.prisma.post
        .findUnique({
          where: { id: parent?.id },
        })
        .author()
    },
  },
  User: {
    posts: (parent: any, _args: any, context: Context) => {
      return context.prisma.user
        .findUnique({
          where: { id: parent?.id },
        })
        .posts()
    },
  },
}






enum SortOrder {
  asc = 'asc',
  desc = 'desc',
}

interface GenderInput {
  id?: number
  type?: string
}


interface PostOrderByUpdatedAtInput {
  updatedAt: SortOrder
}

interface UserUniqueInput {
  id?: number
  email?: string
}

interface PostCreateInput {
  title: string
  content?: string
}

interface UserCreateInput {
  email: string
  name?: string
  posts?: PostCreateInput[]
}


interface onwerCreateInput {
  email: string
  fullname?: string

}

export const schema = makeExecutableSchema({
  resolvers,
  typeDefs,
})
