import { ApolloServer, gql, PubSub } from 'apollo-server';

const pubsub = new PubSub();
const POST_ADDED = 'POST_ADDED';

const posts = [
  {
    author: 'Bob',
    comment: 'Cool Post Bro!'
  }
];

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  type Post {
    author: String!
    comment: String!
  }

  type Query {
    posts: [Post!]!
  }

  type Mutation {
    addPost(author: String!, comment: String!): Post!
  }

  type Subscription {
    postAdded: Post!
  }

`;

// Provide resolver functions for your schema fields
const resolvers = {
  Query: {
    posts() {
      return posts;
    }
  },
  Mutation: {
    addPost(parent, { author, comment }) {
      const newPost = {
        author,
        comment
      };
      posts.push(newPost);
      pubsub.publish(POST_ADDED, { postAdded: newPost });
      return newPost;
    }
  },
  Subscription: {
    postAdded: {
      subscribe: () => pubsub.asyncIterator([POST_ADDED])
    }
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers
});

server.listen().then(({ url, subscriptionsUrl }) => {
  console.log(`🚀 Server ready at ${url}`);
  console.log(`🚀 Subscriptions ready at ${subscriptionsUrl}`);
});
