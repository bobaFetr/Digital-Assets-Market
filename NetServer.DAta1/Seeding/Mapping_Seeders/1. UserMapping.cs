// using System;
// using System.Collections.Generic;
// using System.Text;
// using NetServer.Data.Seeding;
//  using NetServer.Data.Seeding.Constants;
// //using static NetServer.Data.Seeding.Constants.DataSeedingConstants;
// namespace NetServer.Data.Models.Mapping_seeders
// {
//     public  static class UserMapping
//     {
//         public static ICollection<User> GenerateData()
//         {
//             ICollection<User> users = new HashSet<User>()
//             {
//                 new User(DataSeedingConstants.UserConstants.User1Id, DataSeedingConstants.UserConstants.CreatedAt1),
//                 new User(DataSeedingConstants.UserConstants.User1Id, DataSeedingConstants.UserConstants.CreatedAt1),
//                 new User(DataSeedingConstants.UserConstants.User1Id, DataSeedingConstants.UserConstants.CreatedAt1)
//             };
//             return UserSeeding.GenerateUsers();//last edit here. github back end walllet seeding file 2
//         }
//     }
// }//CREATE DATABASE DIAGRAM