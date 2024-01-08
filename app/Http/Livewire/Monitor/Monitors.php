<?php

namespace App\Http\Livewire\Monitor;

use Livewire\Component;
use App\Models\Monitor;
use Exception;
use Symfony\Component\Process\Process;

class Monitors extends Component
{
    public $processName = 'monitor';

    
    public function render()
    {
        return view('livewire.monitor.monitors');
    }

    public function getProcessInformation(){
        $process = new Process(['pm2', 'ls']);

        try{
            $process->mustRun();
        }catch(Exception $error){
            throw new Exception($error->getMessage(), 500);
        }

        $output = $process->getOutput();

        // check if the proccess are in the output
        if(str_contains($output, $this->processName) === false){
            return false;
        }

        // get the process information
        return str_split($output, '\n');

    }
}
