worker code execution strategy
------------------------------
Pluses and minuses on different strategies for executing arbitrary javascript:

exec
  + in process - no thread startup / requirement for waiting thread strategy
  - can overwrite our local variables

vm
  + sandboxed from our local variables
  + in process - no thread startup / requirement for waiting thread strategy
  + we can catch errors using 'domains' without bailing on the master process
  - only basic javascript - no nodeisms - require is not defined. (can this be passed?)

child process
  + all the power of node
  - security issue - might be easy to coerce the app into running arbitrary code
  - need to run apps from the filesystem, not from strings

general thoughts
----------------
Code has no filename so sha1 the content and use that as the name / handle?

Send code and then data arrives when it does. data, data, data, data...

Code is always running in the worker - just call an on_receive when we have 
data. The worker somehow emits results through a similarly standard interface.
How does a vm make a call to the parent? STDIN / STDOUT? Good way to get data
in.
