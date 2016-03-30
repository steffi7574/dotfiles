'use babel';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = {
  panelVisibility: {
    title: 'Panel Visibility',
    description: 'Set when the build panel should be visible.',
    type: 'string',
    'default': 'Toggle',
    'enum': ['Toggle', 'Keep Visible', 'Show on Error', 'Hidden'],
    order: 1
  },
  buildOnSave: {
    title: 'Automatically build on save',
    description: 'Automatically build your project each time an editor is saved.',
    type: 'boolean',
    'default': false,
    order: 2
  },
  saveOnBuild: {
    title: 'Automatically save on build',
    description: 'Automatically save all edited files when triggering a build.',
    type: 'boolean',
    'default': false,
    order: 3
  },
  matchedErrorFailsBuild: {
    title: 'Any matched error will fail the build',
    description: 'Even if the build has a return code of zero it is marked as "failed" if any error is being matched in the output.',
    type: 'boolean',
    'default': true,
    order: 4
  },
  scrollOnError: {
    title: 'Automatically scroll on build error',
    description: 'Automatically scroll to first matched error when a build failed.',
    type: 'boolean',
    'default': false,
    order: 5
  },
  stealFocus: {
    title: 'Steal Focus',
    description: 'Steal focus when opening build panel.',
    type: 'boolean',
    'default': true,
    order: 6
  },
  selectTriggers: {
    title: 'Selecting new target triggers the build',
    description: 'When selecting a new target (through status-bar, cmd-alt-t, etc), the newly selected target will be triggered.',
    type: 'boolean',
    'default': true,
    order: 7
  },
  notificationOnRefresh: {
    title: 'Show notification when targets are refreshed',
    description: 'When targets are refreshed a notification with information about the number of targets will be displayed.',
    type: 'boolean',
    'default': false,
    order: 8
  },
  monocleHeight: {
    title: 'Monocle Height',
    description: 'How much of the workspace to use for build panel when it is "maximized".',
    type: 'number',
    'default': 0.75,
    minimum: 0.1,
    maximum: 0.9,
    order: 9
  },
  minimizedHeight: {
    title: 'Minimized Height',
    description: 'How much of the workspace to use for build panel when it is "minimized".',
    type: 'number',
    'default': 0.15,
    minimum: 0.1,
    maximum: 0.9,
    order: 10
  },
  panelOrientation: {
    title: 'Panel Orientation',
    description: 'Where to attach the build panel',
    type: 'string',
    'default': 'Bottom',
    'enum': ['Bottom', 'Top', 'Left', 'Right'],
    order: 11
  },
  statusBar: {
    title: 'Status Bar',
    description: 'Where to place the status bar. Set to `Disable` to disable status bar display.',
    type: 'string',
    'default': 'Left',
    'enum': ['Left', 'Right', 'Disable'],
    order: 12
  },
  statusBarPriority: {
    title: 'Priority on Status Bar',
    description: 'Lower priority tiles are placed further to the left/right, depends on where you choose to place Status Bar.',
    type: 'number',
    'default': -1000,
    order: 13
  }
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3NndWVudGhlci8uYXRvbS9wYWNrYWdlcy9idWlsZC9saWIvY29uZmlnLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFdBQVcsQ0FBQzs7Ozs7cUJBRUc7QUFDYixpQkFBZSxFQUFFO0FBQ2YsU0FBSyxFQUFFLGtCQUFrQjtBQUN6QixlQUFXLEVBQUUsNkNBQTZDO0FBQzFELFFBQUksRUFBRSxRQUFRO0FBQ2QsZUFBUyxRQUFRO0FBQ2pCLFlBQU0sQ0FBRSxRQUFRLEVBQUUsY0FBYyxFQUFFLGVBQWUsRUFBRSxRQUFRLENBQUU7QUFDN0QsU0FBSyxFQUFFLENBQUM7R0FDVDtBQUNELGFBQVcsRUFBRTtBQUNYLFNBQUssRUFBRSw2QkFBNkI7QUFDcEMsZUFBVyxFQUFFLGdFQUFnRTtBQUM3RSxRQUFJLEVBQUUsU0FBUztBQUNmLGVBQVMsS0FBSztBQUNkLFNBQUssRUFBRSxDQUFDO0dBQ1Q7QUFDRCxhQUFXLEVBQUU7QUFDWCxTQUFLLEVBQUUsNkJBQTZCO0FBQ3BDLGVBQVcsRUFBRSw4REFBOEQ7QUFDM0UsUUFBSSxFQUFFLFNBQVM7QUFDZixlQUFTLEtBQUs7QUFDZCxTQUFLLEVBQUUsQ0FBQztHQUNUO0FBQ0Qsd0JBQXNCLEVBQUU7QUFDdEIsU0FBSyxFQUFFLHVDQUF1QztBQUM5QyxlQUFXLEVBQUUsbUhBQW1IO0FBQ2hJLFFBQUksRUFBRSxTQUFTO0FBQ2YsZUFBUyxJQUFJO0FBQ2IsU0FBSyxFQUFFLENBQUM7R0FDVDtBQUNELGVBQWEsRUFBRTtBQUNiLFNBQUssRUFBRSxxQ0FBcUM7QUFDNUMsZUFBVyxFQUFFLGtFQUFrRTtBQUMvRSxRQUFJLEVBQUUsU0FBUztBQUNmLGVBQVMsS0FBSztBQUNkLFNBQUssRUFBRSxDQUFDO0dBQ1Q7QUFDRCxZQUFVLEVBQUU7QUFDVixTQUFLLEVBQUUsYUFBYTtBQUNwQixlQUFXLEVBQUUsdUNBQXVDO0FBQ3BELFFBQUksRUFBRSxTQUFTO0FBQ2YsZUFBUyxJQUFJO0FBQ2IsU0FBSyxFQUFFLENBQUM7R0FDVDtBQUNELGdCQUFjLEVBQUU7QUFDZCxTQUFLLEVBQUUseUNBQXlDO0FBQ2hELGVBQVcsRUFBRSxnSEFBZ0g7QUFDN0gsUUFBSSxFQUFFLFNBQVM7QUFDZixlQUFTLElBQUk7QUFDYixTQUFLLEVBQUUsQ0FBQztHQUNUO0FBQ0QsdUJBQXFCLEVBQUU7QUFDckIsU0FBSyxFQUFFLDhDQUE4QztBQUNyRCxlQUFXLEVBQUUsMkdBQTJHO0FBQ3hILFFBQUksRUFBRSxTQUFTO0FBQ2YsZUFBUyxLQUFLO0FBQ2QsU0FBSyxFQUFFLENBQUM7R0FDVDtBQUNELGVBQWEsRUFBRTtBQUNiLFNBQUssRUFBRSxnQkFBZ0I7QUFDdkIsZUFBVyxFQUFFLDBFQUEwRTtBQUN2RixRQUFJLEVBQUUsUUFBUTtBQUNkLGVBQVMsSUFBSTtBQUNiLFdBQU8sRUFBRSxHQUFHO0FBQ1osV0FBTyxFQUFFLEdBQUc7QUFDWixTQUFLLEVBQUUsQ0FBQztHQUNUO0FBQ0QsaUJBQWUsRUFBRTtBQUNmLFNBQUssRUFBRSxrQkFBa0I7QUFDekIsZUFBVyxFQUFFLDBFQUEwRTtBQUN2RixRQUFJLEVBQUUsUUFBUTtBQUNkLGVBQVMsSUFBSTtBQUNiLFdBQU8sRUFBRSxHQUFHO0FBQ1osV0FBTyxFQUFFLEdBQUc7QUFDWixTQUFLLEVBQUUsRUFBRTtHQUNWO0FBQ0Qsa0JBQWdCLEVBQUU7QUFDaEIsU0FBSyxFQUFFLG1CQUFtQjtBQUMxQixlQUFXLEVBQUUsaUNBQWlDO0FBQzlDLFFBQUksRUFBRSxRQUFRO0FBQ2QsZUFBUyxRQUFRO0FBQ2pCLFlBQU0sQ0FBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxPQUFPLENBQUU7QUFDMUMsU0FBSyxFQUFFLEVBQUU7R0FDVjtBQUNELFdBQVMsRUFBRTtBQUNULFNBQUssRUFBRSxZQUFZO0FBQ25CLGVBQVcsRUFBRSxnRkFBZ0Y7QUFDN0YsUUFBSSxFQUFFLFFBQVE7QUFDZCxlQUFTLE1BQU07QUFDZixZQUFNLENBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxTQUFTLENBQUU7QUFDcEMsU0FBSyxFQUFFLEVBQUU7R0FDVjtBQUNELG1CQUFpQixFQUFFO0FBQ2pCLFNBQUssRUFBRSx3QkFBd0I7QUFDL0IsZUFBVyxFQUFFLDZHQUE2RztBQUMxSCxRQUFJLEVBQUUsUUFBUTtBQUNkLGVBQVMsQ0FBQyxJQUFJO0FBQ2QsU0FBSyxFQUFFLEVBQUU7R0FDVjtDQUNGIiwiZmlsZSI6Ii9ob21lL3NndWVudGhlci8uYXRvbS9wYWNrYWdlcy9idWlsZC9saWIvY29uZmlnLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgcGFuZWxWaXNpYmlsaXR5OiB7XG4gICAgdGl0bGU6ICdQYW5lbCBWaXNpYmlsaXR5JyxcbiAgICBkZXNjcmlwdGlvbjogJ1NldCB3aGVuIHRoZSBidWlsZCBwYW5lbCBzaG91bGQgYmUgdmlzaWJsZS4nLFxuICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgIGRlZmF1bHQ6ICdUb2dnbGUnLFxuICAgIGVudW06IFsgJ1RvZ2dsZScsICdLZWVwIFZpc2libGUnLCAnU2hvdyBvbiBFcnJvcicsICdIaWRkZW4nIF0sXG4gICAgb3JkZXI6IDFcbiAgfSxcbiAgYnVpbGRPblNhdmU6IHtcbiAgICB0aXRsZTogJ0F1dG9tYXRpY2FsbHkgYnVpbGQgb24gc2F2ZScsXG4gICAgZGVzY3JpcHRpb246ICdBdXRvbWF0aWNhbGx5IGJ1aWxkIHlvdXIgcHJvamVjdCBlYWNoIHRpbWUgYW4gZWRpdG9yIGlzIHNhdmVkLicsXG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgIG9yZGVyOiAyXG4gIH0sXG4gIHNhdmVPbkJ1aWxkOiB7XG4gICAgdGl0bGU6ICdBdXRvbWF0aWNhbGx5IHNhdmUgb24gYnVpbGQnLFxuICAgIGRlc2NyaXB0aW9uOiAnQXV0b21hdGljYWxseSBzYXZlIGFsbCBlZGl0ZWQgZmlsZXMgd2hlbiB0cmlnZ2VyaW5nIGEgYnVpbGQuJyxcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgZGVmYXVsdDogZmFsc2UsXG4gICAgb3JkZXI6IDNcbiAgfSxcbiAgbWF0Y2hlZEVycm9yRmFpbHNCdWlsZDoge1xuICAgIHRpdGxlOiAnQW55IG1hdGNoZWQgZXJyb3Igd2lsbCBmYWlsIHRoZSBidWlsZCcsXG4gICAgZGVzY3JpcHRpb246ICdFdmVuIGlmIHRoZSBidWlsZCBoYXMgYSByZXR1cm4gY29kZSBvZiB6ZXJvIGl0IGlzIG1hcmtlZCBhcyBcImZhaWxlZFwiIGlmIGFueSBlcnJvciBpcyBiZWluZyBtYXRjaGVkIGluIHRoZSBvdXRwdXQuJyxcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgZGVmYXVsdDogdHJ1ZSxcbiAgICBvcmRlcjogNFxuICB9LFxuICBzY3JvbGxPbkVycm9yOiB7XG4gICAgdGl0bGU6ICdBdXRvbWF0aWNhbGx5IHNjcm9sbCBvbiBidWlsZCBlcnJvcicsXG4gICAgZGVzY3JpcHRpb246ICdBdXRvbWF0aWNhbGx5IHNjcm9sbCB0byBmaXJzdCBtYXRjaGVkIGVycm9yIHdoZW4gYSBidWlsZCBmYWlsZWQuJyxcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgZGVmYXVsdDogZmFsc2UsXG4gICAgb3JkZXI6IDVcbiAgfSxcbiAgc3RlYWxGb2N1czoge1xuICAgIHRpdGxlOiAnU3RlYWwgRm9jdXMnLFxuICAgIGRlc2NyaXB0aW9uOiAnU3RlYWwgZm9jdXMgd2hlbiBvcGVuaW5nIGJ1aWxkIHBhbmVsLicsXG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgb3JkZXI6IDZcbiAgfSxcbiAgc2VsZWN0VHJpZ2dlcnM6IHtcbiAgICB0aXRsZTogJ1NlbGVjdGluZyBuZXcgdGFyZ2V0IHRyaWdnZXJzIHRoZSBidWlsZCcsXG4gICAgZGVzY3JpcHRpb246ICdXaGVuIHNlbGVjdGluZyBhIG5ldyB0YXJnZXQgKHRocm91Z2ggc3RhdHVzLWJhciwgY21kLWFsdC10LCBldGMpLCB0aGUgbmV3bHkgc2VsZWN0ZWQgdGFyZ2V0IHdpbGwgYmUgdHJpZ2dlcmVkLicsXG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgb3JkZXI6IDdcbiAgfSxcbiAgbm90aWZpY2F0aW9uT25SZWZyZXNoOiB7XG4gICAgdGl0bGU6ICdTaG93IG5vdGlmaWNhdGlvbiB3aGVuIHRhcmdldHMgYXJlIHJlZnJlc2hlZCcsXG4gICAgZGVzY3JpcHRpb246ICdXaGVuIHRhcmdldHMgYXJlIHJlZnJlc2hlZCBhIG5vdGlmaWNhdGlvbiB3aXRoIGluZm9ybWF0aW9uIGFib3V0IHRoZSBudW1iZXIgb2YgdGFyZ2V0cyB3aWxsIGJlIGRpc3BsYXllZC4nLFxuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICBvcmRlcjogOFxuICB9LFxuICBtb25vY2xlSGVpZ2h0OiB7XG4gICAgdGl0bGU6ICdNb25vY2xlIEhlaWdodCcsXG4gICAgZGVzY3JpcHRpb246ICdIb3cgbXVjaCBvZiB0aGUgd29ya3NwYWNlIHRvIHVzZSBmb3IgYnVpbGQgcGFuZWwgd2hlbiBpdCBpcyBcIm1heGltaXplZFwiLicsXG4gICAgdHlwZTogJ251bWJlcicsXG4gICAgZGVmYXVsdDogMC43NSxcbiAgICBtaW5pbXVtOiAwLjEsXG4gICAgbWF4aW11bTogMC45LFxuICAgIG9yZGVyOiA5XG4gIH0sXG4gIG1pbmltaXplZEhlaWdodDoge1xuICAgIHRpdGxlOiAnTWluaW1pemVkIEhlaWdodCcsXG4gICAgZGVzY3JpcHRpb246ICdIb3cgbXVjaCBvZiB0aGUgd29ya3NwYWNlIHRvIHVzZSBmb3IgYnVpbGQgcGFuZWwgd2hlbiBpdCBpcyBcIm1pbmltaXplZFwiLicsXG4gICAgdHlwZTogJ251bWJlcicsXG4gICAgZGVmYXVsdDogMC4xNSxcbiAgICBtaW5pbXVtOiAwLjEsXG4gICAgbWF4aW11bTogMC45LFxuICAgIG9yZGVyOiAxMFxuICB9LFxuICBwYW5lbE9yaWVudGF0aW9uOiB7XG4gICAgdGl0bGU6ICdQYW5lbCBPcmllbnRhdGlvbicsXG4gICAgZGVzY3JpcHRpb246ICdXaGVyZSB0byBhdHRhY2ggdGhlIGJ1aWxkIHBhbmVsJyxcbiAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICBkZWZhdWx0OiAnQm90dG9tJyxcbiAgICBlbnVtOiBbICdCb3R0b20nLCAnVG9wJywgJ0xlZnQnLCAnUmlnaHQnIF0sXG4gICAgb3JkZXI6IDExXG4gIH0sXG4gIHN0YXR1c0Jhcjoge1xuICAgIHRpdGxlOiAnU3RhdHVzIEJhcicsXG4gICAgZGVzY3JpcHRpb246ICdXaGVyZSB0byBwbGFjZSB0aGUgc3RhdHVzIGJhci4gU2V0IHRvIGBEaXNhYmxlYCB0byBkaXNhYmxlIHN0YXR1cyBiYXIgZGlzcGxheS4nLFxuICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgIGRlZmF1bHQ6ICdMZWZ0JyxcbiAgICBlbnVtOiBbICdMZWZ0JywgJ1JpZ2h0JywgJ0Rpc2FibGUnIF0sXG4gICAgb3JkZXI6IDEyXG4gIH0sXG4gIHN0YXR1c0JhclByaW9yaXR5OiB7XG4gICAgdGl0bGU6ICdQcmlvcml0eSBvbiBTdGF0dXMgQmFyJyxcbiAgICBkZXNjcmlwdGlvbjogJ0xvd2VyIHByaW9yaXR5IHRpbGVzIGFyZSBwbGFjZWQgZnVydGhlciB0byB0aGUgbGVmdC9yaWdodCwgZGVwZW5kcyBvbiB3aGVyZSB5b3UgY2hvb3NlIHRvIHBsYWNlIFN0YXR1cyBCYXIuJyxcbiAgICB0eXBlOiAnbnVtYmVyJyxcbiAgICBkZWZhdWx0OiAtMTAwMCxcbiAgICBvcmRlcjogMTNcbiAgfVxufTtcbiJdfQ==
//# sourceURL=/home/sguenther/.atom/packages/build/lib/config.js
