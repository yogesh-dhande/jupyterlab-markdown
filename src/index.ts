import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { INotebookTracker } from '@jupyterlab/notebook';
import Vue from 'vue';
import VueMarkdownEditor from '@kangc/v-md-editor';
import '@kangc/v-md-editor/lib/style/base-editor.css';
import vuepressTheme from '@kangc/v-md-editor/lib/theme/vuepress.js';
import '@kangc/v-md-editor/lib/theme/style/vuepress.css';

VueMarkdownEditor.use(vuepressTheme, {});

Vue.use(VueMarkdownEditor);
import { Vue as VueType } from 'vue/types/vue';
import { Cell, ICellModel } from '@jupyterlab/cells';

/**
 * Initialization data for the jupyterlab_replnotes_ts extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab_replnotes_ts:plugin',
  autoStart: true,
  requires: [INotebookTracker],
  activate: (app: JupyterFrontEnd, nbTracker: INotebookTracker) => {
    console.log(
      'JupyterLab extension jupyterlab_replnotes_ts is changed again!'
    );
    console.log(app.commands);
    app.commands.commandExecuted.connect((registry, executed) => {
      console.log(executed.id);
      if (executed.id === 'filebrowser:paste') {
        console.log(executed.args);
      }
    });

    const div = document.createElement('div');
    const btn = document.createElement('button');
    btn.innerText = '✏️';

    let vm: VueType | null = null;
    let lastActiveCell: Cell<ICellModel> | null = null;

    nbTracker.currentChanged.connect(() => {
      if (nbTracker.currentWidget) {
        console.log(nbTracker.currentWidget.toolbar);
        nbTracker.activeCellChanged.connect(() => {
          const activeCell = nbTracker.activeCell;
          if (vm) {
            vm?.$el?.parentNode?.removeChild(vm.$el);
            vm.$destroy();
            vm = null;
            console.log(
              lastActiveCell?.node?.querySelector('.jp-MarkdownOutput')
            );
            console.log(lastActiveCell?.node?.children);
            lastActiveCell?.node
              ?.querySelector('.jp-MarkdownOutput')
              ?.classList.remove('lm-mod-hidden');
            lastActiveCell?.node
              ?.querySelector('.jp-InputArea-editor')
              ?.classList.remove('lm-mod-hidden');
          }
          if (activeCell?.model.sharedModel.cell_type === 'markdown') {
            activeCell?.promptNode.appendChild(btn);

            btn.onclick = () => {
              if (vm) {
                vm?.$el?.parentNode?.removeChild(vm.$el);
                vm.$destroy();
                vm = null;
                lastActiveCell?.node
                  ?.querySelector('.jp-MarkdownOutput')
                  ?.classList.remove('lm-mod-hidden');
                lastActiveCell?.node
                  ?.querySelector('.jp-InputArea-editor')
                  ?.classList.remove('lm-mod-hidden');
              } else {
                activeCell?.node
                  ?.querySelector('.jp-InputArea')
                  ?.appendChild(div);
                activeCell?.node
                  ?.querySelector('.jp-MarkdownOutput')
                  ?.classList.add('lm-mod-hidden');
                activeCell?.node
                  ?.querySelector('.jp-InputArea-editor')
                  ?.classList.add('lm-mod-hidden');

                vm = new Vue({
                  el: div,
                  render: h =>
                    h(VueMarkdownEditor, {
                      props: {
                        value: activeCell?.editor.model.value.text
                      },
                      on: {
                        input: (val: string | undefined) => {
                          activeCell?.model.sharedModel.updateSource(
                            0,
                            activeCell?.editor.model.value.text.length,
                            val
                          );
                        }
                      }
                    })
                });
                lastActiveCell = activeCell;
              }
            };
          }
        });
      }
    });
  }
};

export default plugin;
