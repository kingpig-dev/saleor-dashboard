import LinearProgress from "@material-ui/core/LinearProgress";
import { makeStyles, Theme } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { createConfigurationMenu } from "@saleor/configuration";
import useAppState from "@saleor/hooks/useAppState";
import useNavigator from "@saleor/hooks/useNavigator";
import useTheme from "@saleor/hooks/useTheme";
import useUser from "@saleor/hooks/useUser";
import { staffMemberDetailsUrl } from "@saleor/staff/urls";
import React from "react";
import { useIntl } from "react-intl";
import useRouter from "use-react-router";

import Container from "../Container";
import ErrorPage from "../ErrorPage";
import Navigator from "../Navigator";
import NavigatorButton from "../NavigatorButton/NavigatorButton";
import SideBar from "../SideBar";
import SideBarDrawer from "../SideBarDrawer/SideBarDrawer";
import UserChip from "../UserChip";
import AppActionContext from "./AppActionContext";
import AppHeaderContext from "./AppHeaderContext";
import { appLoaderHeight } from "./consts";
import createMenuStructure from "./menuStructure";
import ThemeSwitch from "./ThemeSwitch";

const useStyles = makeStyles(
  theme => ({
    appAction: {
      [theme.breakpoints.down("sm")]: {
        left: 0,
        width: "100%"
      },
      bottom: 0,
      gridColumn: 2,
      position: "sticky",
      zIndex: 10
    },
    appLoader: {
      height: appLoaderHeight,
      marginBottom: theme.spacing(4),
      zIndex: 1201
    },
    appLoaderPlaceholder: {
      height: appLoaderHeight,
      marginBottom: theme.spacing(4)
    },

    content: {
      flex: 1
    },
    darkThemeSwitch: {
      [theme.breakpoints.down("sm")]: {
        marginRight: theme.spacing(1)
      },
      marginRight: theme.spacing(2)
    },
    header: {
      [theme.breakpoints.down("sm")]: {
        height: "auto"
      },
      display: "flex",
      height: 40,
      marginBottom: theme.spacing(3)
    },

    root: {
      display: "flex",
      width: `100%`
    },
    spacer: {
      flex: 1
    },
    userBar: {
      alignItems: "center",
      display: "flex"
    },

    view: {
      flex: 1,
      flexGrow: 1,
      marginLeft: 0,
      paddingBottom: theme.spacing(),
      [theme.breakpoints.up("sm")]: {
        paddingBottom: theme.spacing(3)
      }
    },
    viewContainer: {
      minHeight: `calc(100vh - ${theme.spacing(4) + appLoaderHeight + 120}px)`
    }
  }),
  {
    name: "AppLayout"
  }
);

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const classes = useStyles({});
  const { isDark, toggleTheme } = useTheme();
  const appActionAnchor = React.useRef<HTMLDivElement>();
  const appHeaderAnchor = React.useRef<HTMLDivElement>();
  const { logout, user } = useUser();
  const navigate = useNavigator();
  const intl = useIntl();
  const [appState, dispatchAppState] = useAppState();
  const { location } = useRouter();
  const [isNavigatorVisible, setNavigatorVisibility] = React.useState(false);
  const isMdUp = useMediaQuery((theme: Theme) => theme.breakpoints.up("md"));

  const menuStructure = createMenuStructure(intl);
  const configurationMenu = createConfigurationMenu(intl);
  const userPermissions = user?.userPermissions || [];

  const renderConfigure = configurationMenu.some(section =>
    section.menuItems.some(
      menuItem =>
        !!userPermissions.find(
          userPermission => userPermission.code === menuItem.permission
        )
    )
  );

  const handleErrorBack = () => {
    navigate("/");
    dispatchAppState({
      payload: {
        error: null
      },
      type: "displayError"
    });
  };

  return (
    <>
      <Navigator
        visible={isNavigatorVisible}
        setVisibility={setNavigatorVisibility}
      />
      <AppHeaderContext.Provider value={appHeaderAnchor}>
        <AppActionContext.Provider value={appActionAnchor}>
          <div className={classes.root}>
            {isMdUp && (
              <SideBar
                menuItems={menuStructure}
                location={location.pathname}
                user={user}
                renderConfigure={renderConfigure}
                onMenuItemClick={navigate}
              />
            )}
            <div className={classes.content}>
              {appState.loading ? (
                <LinearProgress className={classes.appLoader} color="primary" />
              ) : (
                <div className={classes.appLoaderPlaceholder} />
              )}
              <div className={classes.viewContainer}>
                <div>
                  <Container>
                    <div className={classes.header}>
                      {isMdUp && <div ref={appHeaderAnchor} />}
                      {!isMdUp && (
                        <SideBarDrawer
                          menuItems={menuStructure}
                          location={location.pathname}
                          user={user}
                          renderConfigure={renderConfigure}
                          onMenuItemClick={navigate}
                        />
                      )}
                      <div className={classes.spacer} />
                      <div className={classes.userBar}>
                        <ThemeSwitch
                          className={classes.darkThemeSwitch}
                          checked={isDark}
                          onClick={toggleTheme}
                        />
                        <NavigatorButton
                          isMac={navigator.platform
                            .toLowerCase()
                            .includes("mac")}
                          onClick={() => setNavigatorVisibility(true)}
                        />
                        <UserChip
                          onLogout={logout}
                          onProfileClick={() =>
                            navigate(staffMemberDetailsUrl(user.id))
                          }
                          user={user}
                        />
                      </div>
                    </div>
                    {!isMdUp && <div ref={appHeaderAnchor} />}
                  </Container>
                </div>
                <main className={classes.view}>
                  {appState.error
                    ? appState.error === "unhandled" && (
                        <ErrorPage onBack={handleErrorBack} />
                      )
                    : children}
                </main>
              </div>
              <div className={classes.appAction} ref={appActionAnchor} />
            </div>
          </div>
        </AppActionContext.Provider>
      </AppHeaderContext.Provider>
    </>
  );
};

export default AppLayout;
