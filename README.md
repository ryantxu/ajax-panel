# Clock Panel Plugin for Grafana

The Clock Panel can show the current time or a countdown and updates every second.

Show the time in another office or show a countdown to an important event.

![Two clocks and a countdown](https://raw.githubusercontent.com/grafana/clock-panel/06ecf59c191db642127c6153bc3145e93a1df1f8/src/img/screenshot-clocks.png)

## Options

- Mode:

  Default is time. If countdown is chosen then set the Countdown Deadline to start the countdown.

- 12 or 24 hour:
  Show time in the 12/24 hour format.
  
- Offset from UTC:
  This is a simple way to get the time for different time zones. Default is empty and that means local time (whatever that is on your computer). -5 would be UTC -5 (New York or central US)

- Countdown Deadline:
  Used in conjuction with the mode being set to countdown. Choose a date and time to count down to.
  
- Date/Time formatting options
  The font size, weight and date formatting can be customized here.

- Bg Color
  Choose a background color for the clock with the color picker.

## Installation

Use the new grafana-cli tool to install clock-panel from the commandline:

```
grafana-cli plugins install clock-panel
```

The plugin will be installed into your grafana plugins directory; the default is /var/lib/grafana/plugins if you installed the grafana package.

More instructions on the cli tool can be found [here](http://docs.grafana.org/v3.0/plugins/installation/).

You need the lastest grafana build for Grafana 3.0 to enable plugin support. You can get it here : http://grafana.org/download/builds.html

