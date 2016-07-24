const React = require('React');
const { filter } = require('fuzzaldrin');
const extend = require('extend');

const NAME = require('./package.json').name;

// Register at least 1 service... Won't load without this.
exports.decorateConfig = config => config;

let activeStyle = { transition: 'opacity 200ms ease-in' };
let inactiveStyle = { color: '#fff', opacity: 0.3 };
let mapIcons = {};
let mapColors = {};
const loadConfig = () => {
  const config = window.config.getConfig();
  if (config.tabIcons) {
    if (config.tabIcons.activeStyle) activeStyle = config.tabIcons.activeStyle;
    if (config.tabIcons.inactiveStyle) inactiveStyle = config.tabIcons.inactiveStyle;
    if (config.tabIcons.mapIcons) mapIcons = config.tabIcons.mapIcons;
    if (config.tabIcons.mapColors) mapColors = config.tabIcons.mapColors;
  }
};

let icons;
let classes;
const loadIcons = () => {
  if (!icons) {
    loadConfig();
    icons = require(`./dist/${NAME}.js`);
    Object.keys(mapIcons).forEach(
      mapIcon => {
        console.log(mapIcon, mapIcons[mapIcon]);
        mapIcons[mapIcon].forEach(
          icon => {
            icons[icon] = icons[mapIcon];
          }
        );
      }
    );
  }

  if (!classes) classes = Object.keys(icons);
};

const getIcon = title => {
  loadIcons();
  const results = filter(classes, title, { maxResults: 1 });
  const match = results.length === 0 ? 'shell' : results[0];
  return { class: icons[match], name: match };
};

const getCustomTitle = (title, active) => {
  const icon = getIcon(title);
  return React.createElement(
    'span',
    {},
    React.createElement(
      'i',
      {
        className: `${icons.ti} ${icon.class}`,
        style: active ?
          extend(
            true,
            {},
            activeStyle,
            mapColors[icon.name] ? { color: mapColors[icon.name] } : {}
          ) :
          inactiveStyle,
      }
    ),
    React.createElement(
      'span',
      {},
      title
    )
  );
};

exports.getTabProps = (uid, parentProps, props) => {
  props.text = getCustomTitle(props.text, props.isActive);
  return props;
};

exports.getTabsProps = (parentProps, props) => {
  if (props.tabs.length !== 1) return props;
  props.tabs[0].title = getCustomTitle(props.tabs[0].title, true);
  return props;
};