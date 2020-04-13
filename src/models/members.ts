import mongoose from "mongoose";

interface IMembers extends mongoose.Document {
  discordId: string;
  inGameName: string;
  inaraName: string;
  joinedPrivateGroup: boolean;
  applicationStatus: any;
  isAdmin: boolean;
  revisionMessages: object[];
}

const membersSchema = new mongoose.Schema({
  discordId: {
    type: String,
    require: true
  },
  inGameName: {
    type: String,
    require: false
  },
  inaraName: {
    type: String,
    require: false
  },
  joinedPrivateGroup: {
    type: Boolean,
    require: true,
    default: false
  },
  applicationStatus: {
    stage: {
      type: Number,
      require: true,
      default: 0
    }, verifiedBy: {
      type: String,
      require: false
    }
  },
  isAdmin: {
    type: Boolean,
    require: true,
    default: false
  },
  revisionMessages: {
    type: Array,
    require: true,
    default: []
  }
}, {collection: "members"});

export default mongoose.model<IMembers>("Members", membersSchema);
