export const typeDefs = `#graphql
  type User {
    id: ID!
    name: String!
    email: String!
    createdAt: String!
  }

  type Company {
    id: ID!
    name: String!
    location: String
    industry: String
    website: String
  }

  type Job {
    id: ID!
    title: String!
    location: String!
    salary: Float
    currency: String!
    jobLink: String
    dateApplied: String
    deadline: String
    status: String!
    description: String
    company: Company!
  }

  type Interview {
    id: ID!
    date: String!
    platform: String
    notes: String
    job: Job!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Query {
    me: User
    jobs: [Job!]!
    companies: [Company!]!
    interviews: [Interview!]!
  }

  type Mutation {
    register(name: String!, email: String!, password: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    createJob(title: String!, companyId: String!, location: String!, status: String): Job!
    updateJobStatus(jobId: ID!, status: String!): Job!
    createCompany(name: String!, location: String, industry: String, website: String): Company!
    createInterview(jobId: ID!, date: String!, platform: String, notes: String): Interview!
    updateInterview(id: ID!, date: String, platform: String, notes: String): Interview!
    deleteInterview(id: ID!): Interview!
  }
`;
