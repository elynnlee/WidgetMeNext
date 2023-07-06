// This is a counter widget with buttons to increment and decrement the number.

const { widget } = figma;
const {
  useSyncedState,
  usePropertyMenu,
  AutoLayout,
  Text,
  SVG,
  Image,
  Frame,
  useSyncedMap,
} = widget;

function Button({
  text,
  textSize = 14,
  onClick,
}: {
  text: string;
  textSize?: number;
  onClick: () => void;
}) {
  return (
    <AutoLayout
      stroke={"#2a2a2a"}
      strokeWidth={2}
      cornerRadius={100}
      padding={10}
      spacing={10}
      onClick={onClick}
    >
      <Text fill={"#2a2a2a"} fontSize={textSize}>
        {text}
      </Text>
    </AutoLayout>
  );
}

function TeammatePhotoBubble({
  figmaUser,
  isActive = false,
}: // onUserSelected = undefined,
{
  figmaUser: User;
  isActive?: boolean;
  // onUserSelected?: (user: User) => void;
}) {
  const photoUrl = figmaUser.photoUrl;
  const teammateName = figmaUser.name;
  const diameter = isActive ? 50 : 30;
  const textWidth = isActive ? undefined : 80;
  const fontSize = isActive ? 20 : 12;
  return (
    <AutoLayout
      direction={"horizontal"}
      horizontalAlignItems="center"
      verticalAlignItems="center"
      spacing={12}
    >
      <AutoLayout stroke={"#2a2a2a"} cornerRadius={100}>
        {photoUrl ? (
          <Image
            cornerRadius={6}
            width={diameter}
            height={diameter}
            src={photoUrl}
          />
        ) : (
          <Frame
            cornerRadius={6}
            width={diameter}
            height={diameter}
            fill="#2A2A2A"
          />
        )}
      </AutoLayout>
      <Text width={textWidth} horizontalAlignText={"left"} fontSize={fontSize}>
        {isActive ? `${teammateName}, it's your turn!` : teammateName}
      </Text>
    </AutoLayout>
  );
}

function TeammatePhotoBubbleRow({
  user1 = undefined,
  user2 = undefined,
  user3 = undefined,
}: // onUserSelected,
{
  key?: any;
  user1?: [User | undefined, number | undefined];
  user2?: [User | undefined, number | undefined];
  user3?: [User | undefined, number | undefined];
  // onUserSelected: (user: User) => void;
}) {
  return (
    <AutoLayout
      direction={"horizontal"}
      verticalAlignItems="center"
      horizontalAlignItems="center"
      spacing={30}
      padding={{ horizontal: 50 }}
    >
      {user1 && user1[0] ? (
        <TeammatePhotoBubble
          figmaUser={user1[0]}
          // hasGone={user1[1]}
          // onUserSelected={onUserSelected}
        />
      ) : null}
      {user2 && user2[0] ? (
        <TeammatePhotoBubble
          figmaUser={user2[0]}
          // hasGone={user2[1]}
          // onUserSelected={onUserSelected}
        />
      ) : null}
      {user3 && user3[0] ? (
        <TeammatePhotoBubble
          figmaUser={user3[0]}
          // hasGone={user3[1]}
          // onUserSelected={onUserSelected}
        />
      ) : null}
    </AutoLayout>
  );
}

function Widget() {
  // List of active users
  const [users, setUsers] = useSyncedState<User[]>("users", () => {
    // uncomment for testing
    // return TEST_ACTIVE_USERS;

    // TODO: initialize activeUsers here instead
    return [];
  });

  const [activeTeammate, setActive] = useSyncedState<User | null>(
    "activeTeammate",
    null
  );

  // order to display users
  const userIdToDisplayOrder = useSyncedMap<number>("displayOrder");
  // map user Ids to User object
  const userIdToUser = useSyncedMap<User>("idToUser");

  const addUserToDisplay = () => {
    const currentUser = figma.currentUser;
    if (
      currentUser &&
      currentUser.id &&
      !userIdToDisplayOrder.get(currentUser.id)
    ) {
      let orderNum = userIdToDisplayOrder.size + 1;
      userIdToDisplayOrder.set(currentUser.id, orderNum);
      userIdToUser.set(currentUser.id, currentUser);
    }
  };

  const printNames = () => {
    const keys = userIdToDisplayOrder.keys();
    console.log(keys);
    for (var i = 0; i < keys.length; i++) {
      let user = userIdToDisplayOrder.get(keys[i]);
      console.log(user);
      console.log(userIdToUser.get(keys[i]));
      let userObj = userIdToUser.get(keys[i]);
      if (userObj) {
        return <TeammatePhotoBubble figmaUser={userObj} />;
      }
    }
  };

  const userFromId = (userId: string) => {};

  return (
    <AutoLayout
      direction={"vertical"}
      fill={"#FFFFFF"}
      stroke={"#E6E6E6"}
      horizontalAlignItems={"center"}
      verticalAlignItems={"center"}
      spacing={20}
      cornerRadius={10}
      padding={{ top: 40, left: 20, right: 20, bottom: 40 }}
    >
      <AutoLayout
        direction="vertical"
        spacing={20}
        horizontalAlignItems={"center"}
        padding={{ top: 0, left: 0, right: 0, bottom: 15 }}
      >
        <Button
          text={"Add me"}
          onClick={() => {
            addUserToDisplay();
          }}
        />
      </AutoLayout>
      <AutoLayout direction={"vertical"} spacing={20}>
        {printNames()}

        <AutoLayout></AutoLayout>

        {/* {userIdToDisplayOrder.map((user, idx, users) => {
          if (idx % 3 != 0) {
            return null;
          }
          var user1hasGone = users[idx]
            ? userIdToDisplayOrder.get(users[idx].id)
            : undefined;
          var user2hasGone = users[idx + 1]
            ? userIdToDisplayOrder.get(users[idx + 1].id)
            : undefined;
          var user3hasGone = users[idx + 2]
            ? userIdToDisplayOrder.get(users[idx + 2].id)
            : undefined;

          return (
            <TeammatePhotoBubbleRow
              key={idx}
              user1={[users[idx], user1hasGone]}
              user2={[users[idx + 1], user2hasGone]}
              user3={[users[idx + 2], user3hasGone]}
            />
          );
        })} */}
      </AutoLayout>
    </AutoLayout>
  );
}

widget.register(Widget);
