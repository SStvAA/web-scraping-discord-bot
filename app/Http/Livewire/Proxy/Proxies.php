<?php

namespace App\Http\Livewire\Proxy;

use App\Models\Proxy;
use Exception;
use Illuminate\Database\QueryException;
use Livewire\Component;

class Proxies extends Component
{   
    public $storeProxyForm, $destroyProxyForm, $storedProxies, $locations;


    protected $rules = [
        'storeProxyForm.location' => [
            'required',
            'in_array:locations.*'
        ],
        'storeProxyForm.ip_address' => [
            'required',
            'string',
            'max:255',
            'unique:proxies,ip_address'
        ],
        'storeProxyForm.port' => [
            'required',
            'digits_between:2,10',
        ],
        'storeProxyForm.username' => [
            'required',
            'string',
            'max:255'
        ],
        'storeProxyForm.password' => [
            'required',
            'string',
            'max:255',
        ],
        'storeProxyForm.start_time' => [
            'required',
            'date_format:H:i'
        ],
        'storeProxyForm.end_time' => [
            'required',
            'date_format:H:i'
        ],
    ];

    protected $validationAttributes = [
        'storeProxyForm.ip_address' => 'dirección IP',
        'storeProxyForm.port' => 'puerto',
        'storeProxyForm.username' => 'usuario',
        'storeProxyForm.password' => 'contraseña',
        'storeProxyForm.start_time' => 'tiempo inicial',
        'storeProxyForm.end_time' => 'tiempo final'
    ];


    public function mount(){
        $this->setDefaultValues();
        $this->getStoredProxies();
    }

    public function render(){
        return view('livewire.proxy.proxies');
    }

    
    /**
     * Store proxy form
     */
    public function storeProxy(){
        $this->validate();
        $this->resetValidation();

        try{
            $proxy = new Proxy;
            $proxy->location = $this->storeProxyForm['location'];
            $proxy->start_range_time = $this->storeProxyForm['start_time'];
            $proxy->end_range_time = $this->storeProxyForm['end_time'];
            $proxy->ip_address = $this->storeProxyForm['ip_address'];
            $proxy->port = $this->storeProxyForm['port'];
            $proxy->username = $this->storeProxyForm['username'];
            $proxy->password = $this->storeProxyForm['password'];

            $proxy->save();
        }catch(QueryException $error){
            return $this->addError('storeProxy', 'Database error');

        }catch(Exception $error){
            return $this->addError('storeProxy', 'Server Error');

        }
        $this->emit('proxyStored');
        $this->setDefaultValues();
        $this->getStoredProxies();

    }

    /**
     * Delete proxy form
     */
    public function destroyProxy(){
        $this->validate([
            'destroyProxyForm.ip_address' => [
                'required',
                'exists:proxies,ip_address'
            ]
        ]);
        $this->resetValidation();

        try{
            $proxy = Proxy::firstWhere('ip_address', $this->destroyProxyForm['ip_address']);
            $proxy->delete();

        }catch(QueryException $error){
            return $this->addError('destroyProxy', 'Database error');

        }catch(Exception $error){
            return $this->addError('destroyProxy', 'Server Error');

        }

        $this->emit('proxyDeleted');
        $this->setDefaultValues();
        $this->getStoredProxies();
    
    }



    /**
     * Set the default values to variable form
     */
    private function setDefaultValues(){
        $this->fill([
            'storeProxyForm' => [
                'location' => '',
                'ip_address' => '',
                'port' => '',
                'username' => '',
                'password' => '',
                'start_time' => '',
                'end_time' => '',
            ],
            'destroyProxyForm' => [
                'ip_address' => ''
            ],
            'locations' => [
                [
                    'code' => 'bra',
                    'name' => 'Brazil'
                ],
                [
                    'code' => 'col',
                    'name' => 'Colombia'
                ],
                [
                    'code' => 'usa',
                    'name' => 'United States'
                ],
                [
                    'code' => 'ven',
                    'name' => 'Venezuela'
                ]
            ]
        ]);
    }

    private function getStoredProxies(){
        $this->storedProxies = Proxy::all();
        return $this->storedProxies;
    }

}
